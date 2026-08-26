import { withErrorHandler } from "@/helpers/ApiHandler";
import { Response } from "@/infra/responses";
import { requestSocketProcess } from "@/infra/socket/internal";
import { type GroupMetadata } from "baileys";
import { NextResponse } from "next/server";

export const GET = withErrorHandler(async () => {
  const { groups } = await requestSocketProcess<{ groups: GroupMetadata[] }>(
    "/groups",
  );

  const responseBody = new Response<IWhatsappGroupsResponse>({
    error: false,
    status_code: 200,
    message: "",
    action: "",
    data: {
      groups: groups.map((group) => ({
        id: group.id,
        subject: group.subject,
        size: group.size ?? group.participants.length,
      })),
    },
  });

  return NextResponse.json(responseBody, { status: responseBody.status_code });
});

export interface IWhatsappGroup {
  id: string;
  subject: string;
  size: number;
}

export interface IWhatsappGroupsResponse {
  groups: IWhatsappGroup[];
}
