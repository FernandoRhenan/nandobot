import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

if (process.env.NODE_ENV !== "production") {
  dotenvExpand.expand(
    dotenv.config({ path: process.env.DOTENV_PATH || ".env.development" }),
  );
}

import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { Server } from "socket.io";
import cron from "node-cron";
import baileys from "@/infra/baileys";
import Publisher from "@/models/publisher";
import {
  type IClientToServerEvents,
  type IServerToClientEvents,
} from "@/infra/socket/events";

const PORT = Number(process.env.SOCKET_PORT) || 3010;
const CORS_ORIGIN = process.env.SOCKET_CORS_ORIGIN || "http://localhost:3000";

const publisher = new Publisher();

async function connectWhatsapp() {
  if (baileys.getConnectionState() !== "close") return;
  await baileys.initConnection();
}

async function disconnect() {
  if (baileys.getConnectionState() === "close") return;
  await baileys.endConnection();
}

async function handleInternalRequest(
  request: IncomingMessage,
  response: ServerResponse,
) {
  const send = (statusCode: number, body: unknown) => {
    response.writeHead(statusCode, { "Content-Type": "application/json" });
    response.end(JSON.stringify(body));
  };

  try {
    if (request.method === "GET" && request.url === "/internal/groups") {
      const groups = await publisher.getGroups();
      return send(200, { groups });
    }

    // if (request.method === 'POST' && request.url === '/internal/post') {
    //   await publisher.postMessageInGroup()
    //   return send(200, {})
    // }

    if (request.method === "POST" && request.url === "/internal/connect") {
      await connectWhatsapp();
      return send(200, {});
    }

    if (request.method === "GET" && request.url === "/internal/state") {
      return send(200, {
        status: baileys.getConnectionState(),
        qr: baileys.getQrCode(),
      });
    }

    return send(404, { message: "Not found." });
  } catch (error) {
    console.error(error);
    return send(503, { message: (error as Error).message });
  }
}

const httpServer = createServer(handleInternalRequest);

const io = new Server<IClientToServerEvents, IServerToClientEvents>(
  httpServer,
  {
    cors: { origin: CORS_ORIGIN },
  },
);

baileys.on("qr", (qr) => io.emit("whatsapp:qr", qr));
baileys.on("status", (status) => io.emit("whatsapp:status", status));

io.on("connection", (socket) => {
  socket.emit("whatsapp:status", baileys.getConnectionState());
  socket.emit("whatsapp:qr", baileys.getQrCode());

  socket.on("whatsapp:connect", connectWhatsapp);
  socket.on("whatsapp:disconnect", disconnect);
});

cron.schedule("*/1 * * * *", async () => {
  if (baileys.getConnectionState() !== "open") return;
  try {
    await publisher.postMessageInGroup();
  } catch (error) {
    console.error(error);
  }
});

httpServer.listen(PORT, () => {
  console.log(`🟢 Socket server ouvindo na porta ${PORT}`);
});
