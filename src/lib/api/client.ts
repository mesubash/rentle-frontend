import type { ApiEnvelope, RequestQuery } from "./shared";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | object | null;
  query?: RequestQuery;
};

function buildUrl(path: string, query?: RequestQuery) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`/api/rentle${normalizedPath}`, window.location.origin);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return `${url.pathname}${url.search}`;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  const { body, headers, query, ...requestOptions } = options;
  const isFormData = body instanceof FormData;
  const serializedBody =
    body && !isFormData && typeof body === "object" ? JSON.stringify(body) : body;

  const response = await fetch(buildUrl(path, query), {
    ...requestOptions,
    body: serializedBody as BodyInit | null | undefined,
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(!isFormData && body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
  });

  const contentType = response.headers.get("content-type") ?? "";
  const envelope = contentType.includes("application/json")
    ? ((await response.json()) as ApiEnvelope<T>)
    : null;

  if (!response.ok || envelope?.error) {
    throw new ApiError(
      envelope?.error ?? `Request failed with status ${response.status}`,
      response.status,
    );
  }

  if (!envelope || envelope.data === null) {
    throw new ApiError("The server returned an empty response", response.status);
  }

  return envelope.data;
}

export function toFormData(entries: Record<string, File | File[] | string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, item));
    } else {
      formData.append(key, value);
    }
  }
  return formData;
}
