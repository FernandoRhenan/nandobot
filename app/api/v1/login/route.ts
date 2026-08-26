import { withErrorHandler } from "@/helpers/ApiHandler";
import {
  AUTH_COOKIE,
  AUTH_MAX_AGE_SECONDS,
  createAuthToken,
} from "@/helpers/auth";
import { Response } from "@/infra/responses";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const loginSchema = z.object({
  password: z.string().min(1, "Informe a senha."),
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const { password } = loginSchema.parse(await request.json());

  if (password !== process.env.AUTH_PASSWORD) {
    const body = new Response({
      error: true,
      status_code: 401,
      message: "Senha incorreta.",
      action: "Verifique a senha e tente novamente.",
    });
    return NextResponse.json(body, { status: body.status_code });
  }

  const body = new Response({
    error: false,
    status_code: 200,
    message: "Autenticado com sucesso.",
  });
  const response = NextResponse.json(body, { status: body.status_code });

  response.cookies.set(AUTH_COOKIE, await createAuthToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_MAX_AGE_SECONDS,
  });

  return response;
});

export const DELETE = withErrorHandler(async () => {
  const body = new Response({
    error: false,
    status_code: 200,
    message: "Sessão encerrada.",
  });
  const response = NextResponse.json(body, { status: body.status_code });
  response.cookies.delete(AUTH_COOKIE);
  return response;
});
