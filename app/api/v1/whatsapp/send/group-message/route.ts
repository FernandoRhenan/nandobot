import { withErrorHandler } from "@/helpers/ApiHandler";
import { Response } from "@/infra/responses";
import Publisher, { IPostMessageInGroups } from "@/models/publisher";
import postMessageInGroups from "@/validators/postMessageInGroups";
import { NextResponse } from "next/server";

export const POST = withErrorHandler(async (request) => {
  const body: IPostMessageInGroups = await request.json();

  const bodyValidated: IPostMessageInGroups = postMessageInGroups.parse(body);

  const publisher = new Publisher();
  await publisher.enqueueMessagesInGroups(bodyValidated);

  const responseBody = new Response({
    error: false,
    status_code: 201,
    message: "Messages enqueued.",
    action: "",
  });

  return NextResponse.json(responseBody, { status: responseBody.status_code });
});
