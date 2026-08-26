import { io, type Socket } from "socket.io-client";
import type {
  IClientToServerEvents,
  IServerToClientEvents,
} from "@/infra/socket/events";

export type AppSocket = Socket<IServerToClientEvents, IClientToServerEvents>;

let socket: AppSocket | null = null;

export function getSocket(): AppSocket {
  if (!socket) {
    // Sem NEXT_PUBLIC_SOCKET_URL (produção), io() conecta same-origin
    // (https://radar-de-ofertas.com/socket.io/) e o nginx proxeia para :3010.
    // Em dev, .env.development define http://localhost:3010.
    socket = process.env.NEXT_PUBLIC_SOCKET_URL
      ? io(process.env.NEXT_PUBLIC_SOCKET_URL)
      : io();
  }

  return socket;
}
