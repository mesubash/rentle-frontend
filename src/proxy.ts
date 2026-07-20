import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ACCESS_COOKIE = "rentle_access_token";
const REFRESH_COOKIE = "rentle_refresh_token";

export function proxy(request: NextRequest) {
  const hasSession = Boolean(
    request.cookies.get(ACCESS_COOKIE)?.value ||
    request.cookies.get(REFRESH_COOKIE)?.value,
  );

  const isAuthPage = request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register";

  if (isAuthPage) {
    // A cookie can outlive the backend session. Always allow the auth page to
    // render so AuthProvider can validate it; AuthForm redirects genuinely
    // signed-in users after that check. Redirecting on cookie presence alone
    // traps stale sessions in a /list -> /login -> /list loop.
    return NextResponse.next();
  }

  if (hasSession) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/bookings/:path*",
    "/messages/:path*",
    "/notifications/:path*",
    "/list/:path*",
    "/listings/manage/:path*",
    "/verification/:path*",
    "/profile",
    "/profile/edit/:path*",
    "/workers/:path*",
    "/provider-verification/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
