import { withErrorHandler } from "@/helpers/ApiHandler";
import { Response } from "@/infra/responses";
import { requestSocketProcess } from "@/infra/socket/internal";
import { NextResponse } from "next/server";

export const GET = withErrorHandler(async () => {
  const { qr } = await requestSocketProcess<IWhatsappQrResponse>("/state");

  const responseBody = new Response({
    error: false,
    status_code: 200,
    message: "",
    action: "",
    data: { qr },
  });

  return NextResponse.json(responseBody, { status: responseBody.status_code });
});

export interface IWhatsappQrResponse {
  qr: string | null;
}
