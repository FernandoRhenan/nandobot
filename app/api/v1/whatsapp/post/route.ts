import { withErrorHandler } from "@/helpers/ApiHandler";
import { Response } from "@/infra/responses";
import { requestSocketProcess } from "@/infra/socket/internal";
import { NextResponse } from "next/server";

export const POST = withErrorHandler(async () => {
  await requestSocketProcess("/post", { method: "POST" });

  const responseBody = new Response({
    error: false,
    status_code: 201,
    message: "Messages enqueued.",
    action: "",
  });

  return NextResponse.json(responseBody, { status: responseBody.status_code });
});
