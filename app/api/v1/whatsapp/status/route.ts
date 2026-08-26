import { withErrorHandler } from "@/helpers/ApiHandler";
import { type ConnectionStatus } from "@/infra/baileys";
import { Response } from "@/infra/responses";
import { requestSocketProcess } from "@/infra/socket/internal";
import { NextResponse } from "next/server";

export const GET = withErrorHandler(async () => {
  const { status } =
    await requestSocketProcess<IWhatsappStatusResponse>("/state");

  const responseBody = new Response({
    error: false,
    status_code: 200,
    message: "",
    action: "",
    data: { status },
  });

  return NextResponse.json(responseBody, { status: responseBody.status_code });
});

export interface IWhatsappStatusResponse {
  status: ConnectionStatus | null;
}
