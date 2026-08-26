import makeWASocket, {
  AuthenticationCreds,
  AuthenticationState,
  Browsers,
  BufferJSON,
  DisconnectReason,
  initAuthCreds,
  makeCacheableSignalKeyStore,
  proto,
  SignalDataTypeMap,
  type WASocket,
} from "baileys";

import { Boom } from "@hapi/boom";
import { EventEmitter } from "node:events";
import redis, { redisKeys } from "./redis";
import { ServiceError } from "./error";

export type ConnectionStatus = "open" | "connecting" | "close";

type BaileysEvents = {
  qr: [qr: string | null];
  status: [status: ConnectionStatus];
};

// Not present in DisconnectReason: whatsapp refused the handshake, usually
// because this IP made too many registration attempts in a short window.
const CONNECTION_FAILURE_STATUS = 405;

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 60_000;

class Baileys extends EventEmitter<BaileysEvents> {
  public sock: WASocket | null = null;
  private qr: string | null = null;
  private connectionState: ConnectionStatus = "close";
  private activeSock: WASocket | null = null;
  private socketGeneration = 0;
  private isConnecting = false;
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  private async getAuthState(): Promise<{
    state: AuthenticationState;
    saveCreds: () => Promise<void>;
  }> {
    const redisClient = await redis.startConnection();
    const storedCreds = await redisClient.get(redisKeys.AUTH_CREDS_KEY);
    const creds: AuthenticationCreds = storedCreds
      ? JSON.parse(storedCreds, BufferJSON.reviver)
      : initAuthCreds();

    const keys = makeCacheableSignalKeyStore({
      get: async (type, ids) => {
        const redisClient = await redis.startConnection();
        const data: Record<string, unknown> = {};

        await Promise.all(
          ids.map(async (id) => {
            const value = await redisClient.get(
              `${redisKeys.AUTH_KEYS_PREFIX}${type}:${id}`,
            );
            if (!value) return;

            let parsedValue = JSON.parse(value, BufferJSON.reviver);
            if (type === "app-state-sync-key") {
              parsedValue =
                proto.Message.AppStateSyncKeyData.fromObject(parsedValue);
            }

            data[id] = parsedValue;
          }),
        );

        return data as { [id: string]: SignalDataTypeMap[typeof type] };
      },
      set: async (data) => {
        const redisClient = await redis.startConnection();
        const tasks: Promise<unknown>[] = [];

        for (const type in data) {
          const category = data[type as keyof SignalDataTypeMap];
          for (const id in category) {
            const value = category[id];
            const key = `${redisKeys.AUTH_KEYS_PREFIX}${type}:${id}`;

            tasks.push(
              value
                ? redisClient.set(
                    key,
                    JSON.stringify(value, BufferJSON.replacer),
                  )
                : redisClient.del(key),
            );
          }
        }

        await Promise.all(tasks);
      },
    });

    const saveCreds = async () => {
      const redisClient = await redis.startConnection();
      await redisClient.set(
        redisKeys.AUTH_CREDS_KEY,
        JSON.stringify(creds, BufferJSON.replacer),
      );
    };

    return { state: { creds, keys }, saveCreds };
  }

  private async clearSession() {
    const redisClient = await redis.startConnection();
    const keys = await redisClient.keys(`${redisKeys.AUTH_KEYS_PREFIX}*`);
    await Promise.all([
      redisClient.del(redisKeys.AUTH_CREDS_KEY),
      ...(keys.length ? [redisClient.del(keys)] : []),
    ]);
    this.setConnectionState("close");
  }

  async initConnection() {
    this.reconnectAttempts = 0;
    await this.connect();
  }

  private async connect() {
    if (this.isConnecting) return;
    this.isConnecting = true;

    this.clearReconnectTimeout();
    await this.closeSocket();

    // Events from a socket we already gave up on must not drive the state.
    const generation = ++this.socketGeneration;

    try {
      const { state, saveCreds } = await this.getAuthState();
      const sock = makeWASocket({
        auth: state,
        countryCode: "BR",
        markOnlineOnConnect: false,
        browser: Browsers.ubuntu("Chrome"),
      });

      this.activeSock = sock;

      sock.ev.on("connection.update", async (update) => {
        if (generation !== this.socketGeneration) return;

        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.setQrCode(qr);
        }

        if (connection === "connecting") {
          this.sock = sock;
          this.setConnectionState("connecting");
        }

        if (connection === "open") {
          this.sock = sock;
          this.reconnectAttempts = 0;

          this.setQrCode(null);
          this.setConnectionState("open");

          console.log("status:", "Open Connection");
        }

        if (connection === "close") {
          await this.handleClose(lastDisconnect?.error);
        }
      });

      sock.ev.on("creds.update", saveCreds);
    } catch (error) {
      console.log(error);
      await this.clearSession();
    } finally {
      this.isConnecting = false;
    }
  }

  private async handleClose(error?: Error) {
    await this.closeSocket();

    this.setQrCode(null);
    this.setConnectionState("close");

    const statusCode = (error as Boom)?.output?.statusCode;

    console.log("lastDisconnect", statusCode, error?.message);

    // The session will never work again: wipe the creds so the next connection
    // starts a fresh pairing instead of reusing a dead device.
    if (
      statusCode === DisconnectReason.loggedOut ||
      statusCode === DisconnectReason.forbidden ||
      statusCode === DisconnectReason.badSession ||
      statusCode === DisconnectReason.multideviceMismatch
    ) {
      await this.clearSession();
      return;
    }

    // Whatsapp asks for a restart right after the qr code is scanned.
    if (statusCode === DisconnectReason.restartRequired) {
      this.scheduleReconnect(0);
      return;
    }

    // Retrying here only keeps the block alive, so stop and let the user
    // trigger a new connection later.
    if (statusCode === CONNECTION_FAILURE_STATUS) {
      console.log(
        "Whatsapp refused the connection (405). Reconnection stopped, try again later.",
      );
      return;
    }

    this.scheduleReconnect();
  }

  private scheduleReconnect(delayMs?: number) {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.log(
        `Whatsapp reconnection gave up after ${MAX_RECONNECT_ATTEMPTS} attempts.`,
      );
      this.reconnectAttempts = 0;
      return;
    }

    const delay =
      delayMs ??
      Math.min(
        RECONNECT_BASE_DELAY_MS * 2 ** this.reconnectAttempts,
        RECONNECT_MAX_DELAY_MS,
      );

    this.reconnectAttempts += 1;
    this.clearReconnectTimeout();

    console.log(
      `Reconnecting to whatsapp in ${delay}ms (attempt ${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}).`,
    );

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect().catch((error) => console.log(error));
    }, delay);
  }

  private clearReconnectTimeout() {
    if (!this.reconnectTimeout) return;

    clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = null;
  }

  private async closeSocket() {
    const sock = this.activeSock;

    this.activeSock = null;
    this.sock = null;

    if (!sock) return;

    sock.ev.removeAllListeners("connection.update");
    sock.ev.removeAllListeners("creds.update");

    try {
      await sock.end(undefined);
    } catch {
      // The socket was already dead.
    }
  }

  async endConnection(): Promise<void> {
    this.clearReconnectTimeout();
    this.reconnectAttempts = 0;
    // Silence the close event triggered by the logout below.
    this.socketGeneration += 1;

    try {
      await this.sock?.logout();
    } catch (error) {
      console.log(error);
    }

    await this.closeSocket();
    await this.clearSession();
    this.setQrCode(null);
  }

  private setConnectionState(state: ConnectionStatus) {
    this.connectionState = state;
    this.emit("status", state);
  }

  getConnectionState() {
    return this.connectionState;
  }

  private setQrCode(qr: string | null) {
    this.qr = qr;
    this.emit("qr", qr);
  }

  getQrCode() {
    return this.qr;
  }

  async getConnectedSocket(): Promise<WASocket> {
    if (!this.sock) {
      throw new ServiceError({
        message: "Whatsapp is not connected.",
        cause: "BaileysNotConnected",
      });
    }

    return this.sock;
  }
}

const baileys = new Baileys();

export default baileys;
