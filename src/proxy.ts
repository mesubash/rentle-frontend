import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ACCESS_COOKIE = "rentle_access_token";
const REFRESH_COOKIE = "rentle_refresh_token";

export function proxy(request: NextRequest) {
  const hasSession = Boolean(
    request.cookies.get(ACCESS_COOKIE)?.value ||
    request.cookies.get(REFRESH_COOKIE)?.value,
  );

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
  ],
};
