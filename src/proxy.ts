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
    if (!hasSession) return NextResponse.next();

    const requestedNext = request.nextUrl.searchParams.get("next");
    const destination = safeNext(requestedNext);
    return NextResponse.redirect(new URL(destination, request.url));
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

function safeNext(value: string | null) {
  if (!value?.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/explore";
  const pathname = value.split(/[?#]/, 1)[0];
  const authRoutes = ["/login", "/register", "/auth/login", "/auth/register"];
  return authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`)) ? "/explore" : value;
}
