import type { NextRequest } from "next/server";

const BACKEND_BASE = (process.env.RENTLE_BACKEND_URL ?? "http://localhost:8080").replace(/\/$/, "");

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const response = await fetch(
    `${BACKEND_BASE}/files/${path.map(encodeURIComponent).join("/")}`,
    { cache: "no-store" },
  );

  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": response.ok ? "public, max-age=3600" : "no-store",
    },
  });
}
