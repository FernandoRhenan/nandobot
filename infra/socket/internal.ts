import { ServiceError } from "@/infra/error";

const INTERNAL_URL =
  process.env.SOCKET_INTERNAL_URL || "http://localhost:3010/internal";

export async function requestSocketProcess<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  let response: globalThis.Response;

  try {
    response = await fetch(`${INTERNAL_URL}${path}`, init);
  } catch (error) {
    throw new ServiceError({
      message: "Whatsapp service is unavailable.",
      cause: error,
    });
  }

  const body = await response.json();

  if (!response.ok) {
    throw new ServiceError({
      message: body?.message ?? "Whatsapp service is unavailable.",
      cause: "SocketProcessError",
    });
  }

  return body as T;
}
