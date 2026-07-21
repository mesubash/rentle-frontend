import type { ApiEnvelope } from "./shared";

/**
 * Server-side reads for public data.
 *
 * The browser client (`./client`) builds URLs from `window.location.origin` and goes through the
 * /api/rentle proxy, so it cannot run in a server component. This talks to the backend directly,
 * which also removes the proxy hop for these reads.
 *
 * Public endpoints only — nothing here forwards session cookies, so anything user-specific must
 * still be fetched from the client.
 */
const API_BASE = (process.env.RENTLE_API_URL ?? "http://localhost:8080/api/v1").replace(/\/$/, "");

export async function serverRead<T>(path: string, revalidateSeconds = 60): Promise<T | null> {
  const normalized = path.startsWith("/") ? path : `/${path}`;

  try {
    const response = await fetch(`${API_BASE}${normalized}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: revalidateSeconds },
    });

    if (!response.ok) return null;

    const envelope = (await response.json()) as ApiEnvelope<T>;
    return envelope.data ?? null;
  } catch {
    // The page falls back to fetching on the client, so a backend blip degrades rather than 500s.
    return null;
  }
}
