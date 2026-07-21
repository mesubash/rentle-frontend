import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ACCESS_COOKIE = "rentle_access_token";
const REFRESH_COOKIE = "rentle_refresh_token";
/** Readable by client JS, unlike the httpOnly session cookies it mirrors. */
const SESSION_HINT_COOKIE = "rentle_has_session";

/**
 * Routes that require a session. This list must mirror what `config.matcher` used to contain:
 * the matcher now also covers public pages so the session hint can be set on them, which means
 * "this request matched" no longer implies "this route is protected".
 *
 * Note `/profile` is exact — `/profile/[username]` is a public profile page.
 */
const PROTECTED = [
  /^\/bookings(\/.*)?$/,
  /^\/messages(\/.*)?$/,
  /^\/notifications(\/.*)?$/,
  /^\/list(\/.*)?$/,
  /^\/listings\/manage(\/.*)?$/,
  /^\/verification(\/.*)?$/,
  /^\/profile$/,
  /^\/profile\/edit(\/.*)?$/,
  /^\/workers(\/.*)?$/,
  /^\/provider-verification(\/.*)?$/,
  /^\/admin(\/.*)?$/,
];

/**
 * Mirror "is there a session?" into a non-httpOnly cookie.
 *
 * The root layout used to answer this with `cookies()`, which opted every route in the app out
 * of static generation — including pages like /about and /terms that have no dynamic content at
 * all. Doing it here keeps the optimisation (a logged-out visitor still makes zero API calls)
 * while letting those routes prerender.
 *
 * The hint carries no authority: it only decides whether the client bothers probing /users/me.
 * The session cookies stay httpOnly and the backend remains the authority.
 */
function withSessionHint(response: NextResponse, request: NextRequest, hasSession: boolean) {
  const desired = hasSession ? "1" : "0";
  if (request.cookies.get(SESSION_HINT_COOKIE)?.value !== desired) {
    response.cookies.set(SESSION_HINT_COOKIE, desired, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }
  return response;
}

export function proxy(request: NextRequest) {
  const hasSession = Boolean(
    request.cookies.get(ACCESS_COOKIE)?.value ||
    request.cookies.get(REFRESH_COOKIE)?.value,
  );

  const { pathname, search } = request.nextUrl;
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    // A cookie can outlive the backend session. Always allow the auth page to
    // render so AuthProvider can validate it; AuthForm redirects genuinely
    // signed-in users after that check. Redirecting on cookie presence alone
    // traps stale sessions in a /list -> /login -> /list loop.
    return withSessionHint(NextResponse.next(), request, hasSession);
  }

  if (!PROTECTED.some((pattern) => pattern.test(pathname))) {
    return withSessionHint(NextResponse.next(), request, hasSession);
  }

  if (hasSession) return withSessionHint(NextResponse.next(), request, hasSession);

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return withSessionHint(NextResponse.redirect(loginUrl), request, hasSession);
}

export const config = {
  // Broadened beyond the protected routes so the session hint reaches public pages too.
  // Static assets and the API proxy are excluded — only page requests need the hint.
  matcher: [
    "/((?!_next/static|_next/image|api/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico|webmanifest|txt|xml)$).*)",
  ],
};
