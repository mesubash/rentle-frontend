import type { NextRequest } from "next/server";

const BACKEND_BASE = (process.env.RENTLE_BACKEND_URL ?? "http://localhost:8080").replace(/\/$/, "");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  // Uploaded files are immutable at a given path, so forward the client's validators and
  // let the backend answer 304 instead of re-streaming the body.
  const inboundEtag = request.headers.get("if-none-match");
  const inboundModified = request.headers.get("if-modified-since");
  const response = await fetch(
    `${BACKEND_BASE}/files/${path.map(encodeURIComponent).join("/")}`,
    {
      headers: {
        ...(inboundEtag ? { "If-None-Match": inboundEtag } : {}),
        ...(inboundModified ? { "If-Modified-Since": inboundModified } : {}),
      },
      next: { revalidate: 60 * 60 * 24 },
    },
  );

  const headers = new Headers({
    "Cache-Control": response.ok || response.status === 304
      ? "public, max-age=31536000, immutable"
      : "no-store",
  });
  // Pass through the upstream validators so revalidation can 304 rather than re-download.
  for (const header of ["content-type", "content-length", "etag", "last-modified"]) {
    const value = response.headers.get(header);
    if (value) headers.set(header, value);
  }
  if (!headers.has("content-type")) headers.set("Content-Type", "application/octet-stream");

  if (response.status === 304) return new Response(null, { status: 304, headers });
  return new Response(response.body, { status: response.status, headers });
}
