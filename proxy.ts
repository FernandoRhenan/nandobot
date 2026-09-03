import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, verifyAuthToken } from "@/helpers/auth";

// Public paths that never require authentication.
const PUBLIC_PATHS = new Set(["/", "/login", "/api/v1/login"]);

// Public prefixes: every product has its own public sell page.
const PUBLIC_PREFIXES = ["/product/"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic =
    PUBLIC_PATHS.has(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isPublic) {
    return NextResponse.next();
  }

  const isAuthenticated = await verifyAuthToken(
    request.cookies.get(AUTH_COOKIE)?.value,
  );

  if (isAuthenticated) {
    return NextResponse.next();
  }

  // Unauthenticated: block APIs with 401, redirect pages to /login.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      {
        error: true,
        status_code: 401,
        message: "Authentication required.",
        action: "Log in and try again.",
      },
      { status: 401 },
    );
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|txt|xml)$).*)",
  ],
};
