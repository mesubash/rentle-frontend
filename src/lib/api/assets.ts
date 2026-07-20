export function assetUrl(value?: string | null) {
  if (!value) return null;
  if (/^https?:\/\//.test(value)) return value;

  const path = value.replace(/^\/?files\//, "").replace(/^\/+/, "");
  return `/api/rentle-files/${path}`;
}
