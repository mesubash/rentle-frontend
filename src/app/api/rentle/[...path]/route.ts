import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ACCESS_COOKIE = "rentle_access_token";
const REFRESH_COOKIE = "rentle_refresh_token";
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;
const API_BASE = (process.env.RENTLE_API_URL ?? "http://localhost:8080/api/v1").replace(/\/$/, "");

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

type AuthPayload = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: unknown;
};

type Envelope<T> = {
  data: T | null;
  error: string | null;
  timestamp: string;
};

const refreshes = new Map<string, Promise<AuthPayload | null>>();

function backendUrl(path: string[], request: NextRequest) {
  const url = new URL(`${API_BASE}/${path.map(encodeURIComponent).join("/")}`);
  request.nextUrl.searchParams.forEach((value, key) => url.searchParams.append(key, value));
  return url;
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

function applySession(response: NextResponse, auth: AuthPayload) {
  response.cookies.set(ACCESS_COOKIE, auth.accessToken, cookieOptions(auth.expiresIn));
  response.cookies.set(REFRESH_COOKIE, auth.refreshToken, cookieOptions(REFRESH_MAX_AGE));
}

function clearSession(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE, "", cookieOptions(0));
  response.cookies.set(REFRESH_COOKIE, "", cookieOptions(0));
}

async function refreshSession(refreshToken: string) {
  const existing = refreshes.get(refreshToken);
  if (existing) return existing;

  const refresh = (async () => {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) return null;
    const envelope = (await response.json()) as Envelope<AuthPayload>;
    return envelope.data;
  })().finally(() => refreshes.delete(refreshToken));

  refreshes.set(refreshToken, refresh);
  return refresh;
}

async function forward(
  request: NextRequest,
  context: RouteContext,
) {
  const { path } = await context.params;
  const route = path.join("/");
  const method = request.method.toUpperCase();
  const incomingContentType = request.headers.get("content-type");
  const originalBody = method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer();
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  const perform = (token?: string, body: BodyInit | null | undefined = originalBody) => {
    const headers = new Headers({ Accept: "application/json" });
    if (incomingContentType) headers.set("Content-Type", incomingContentType);
    else if (route === "auth/logout" || route === "auth/refresh") {
      headers.set("Content-Type", "application/json");
    }
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(backendUrl(path, request), {
      method,
      body,
      headers,
      cache: "no-store",
    });
  };

  let backendResponse: Response;
  if (route === "auth/logout") {
    backendResponse = await perform(
      accessToken,
      JSON.stringify({ refreshToken: refreshToken ?? "" }),
    );
  } else if (route === "auth/refresh") {
    backendResponse = await perform(
      undefined,
      JSON.stringify({ refreshToken: refreshToken ?? "" }),
    );
  } else {
    backendResponse = await perform(accessToken);
  }

  let refreshed: AuthPayload | null = null;
  if (
    backendResponse.status === 401 &&
    refreshToken &&
    !route.startsWith("auth/")
  ) {
    refreshed = await refreshSession(refreshToken);
    if (refreshed) backendResponse = await perform(refreshed.accessToken);
  }

  // Endpoints that return a token pair to be stored as httpOnly cookies.
  const isAuthResponse = [
    "auth/login",
    "auth/register",
    "auth/google/exchange",
    "auth/refresh",
  ].includes(route);
  if (isAuthResponse && backendResponse.ok) {
    const envelope = (await backendResponse.json()) as Envelope<AuthPayload>;
    if (envelope.data) {
      const auth = envelope.data;
      const response = NextResponse.json({
        ...envelope,
        data: { user: auth.user, expiresIn: auth.expiresIn },
      });
      applySession(response, auth);
      return response;
    }
  }

  const response = new NextResponse(backendResponse.body, {
    status: backendResponse.status,
    headers: {
      "Content-Type": backendResponse.headers.get("content-type") ?? "application/json",
      "Cache-Control": "no-store",
    },
  });

  if (refreshed) applySession(response, refreshed);
  if (route === "auth/logout" || (backendResponse.status === 401 && refreshToken && !refreshed)) {
    clearSession(response);
  }
  return response;
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
