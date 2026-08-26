import { AUTH_COOKIE } from "@/helpers/auth";

let sessionCookie: string | null = null;

async function login() {
  const response = await fetch("http://localhost:3000/api/v1/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: process.env.AUTH_PASSWORD }),
  });

  if (response.status !== 200) {
    throw new Error(
      `Test login failed with status ${response.status}. Check AUTH_PASSWORD in .env.development.`,
    );
  }

  const cookie = response.headers
    .getSetCookie()
    .find((setCookie) => setCookie.startsWith(`${AUTH_COOKIE}=`));

  if (!cookie) {
    throw new Error(`Login response did not set the ${AUTH_COOKIE} cookie.`);
  }

  return cookie.split(";")[0];
}

// Same signature as `fetch`, but carries the session cookie that `proxy.ts`
// requires on every non-public route.
export default async function authenticatedFetch(
  input: string | URL,
  init: RequestInit = {},
) {
  sessionCookie ??= await login();

  const headers = new Headers(init.headers);
  headers.set("Cookie", sessionCookie);

  return await fetch(input, { ...init, headers });
}
