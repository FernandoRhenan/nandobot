import { withErrorHandler } from "@/helpers/ApiHandler";
import { Response } from "@/infra/responses";
import { requestSocketProcess } from "@/infra/socket/internal";
import { NextResponse } from "next/server";

export const GET = withErrorHandler(async () => {
  await requestSocketProcess("/connect", { method: "POST" });

  const responseBody = new Response({
    error: false,
    status_code: 200,
    message: "Connection initialized.",
  });
  return NextResponse.json(responseBody, { status: responseBody.status_code });
});
