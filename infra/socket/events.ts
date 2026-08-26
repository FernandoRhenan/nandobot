import type { ConnectionStatus } from "@/infra/baileys";

export interface IServerToClientEvents {
  "whatsapp:qr": (qr: string | null) => void;
  "whatsapp:status": (status: ConnectionStatus) => void;
}

export interface IClientToServerEvents {
  "whatsapp:connect": () => void;
  "whatsapp:disconnect": () => void;
}
