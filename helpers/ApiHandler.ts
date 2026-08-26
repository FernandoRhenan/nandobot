import { Response as systemResponse } from "@/infra/responses";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

type RouteHandler<T> = (
  request: NextRequest,
  { params }: { params: Promise<T> },
) => Promise<NextResponse | Response>;

export function withErrorHandler<T>(handler: RouteHandler<T>): RouteHandler<T> {
  return async (request: NextRequest, { params }) => {
    try {
      return await handler(request, { params });
    } catch (err) {
      if (err instanceof ZodError) {
        const first = err.issues[0];
        const body = new systemResponse({
          error: true,
          status_code: 400,
          message: first?.message ?? "A validation error occurs.",
          action: "Adjust the data and try again.",
        });
        return NextResponse.json(body, { status: body.status_code });
      } else {
        console.error(err);
        const body = new systemResponse({
          error: true,
          status_code: 500,
          message: "An unexpected error occurs.",
          action: "Contact the support.",
        });
        return NextResponse.json(body, { status: body.status_code });
      }
    }
  };
}
