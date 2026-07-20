export const NEPAL_COUNTRY_CODE = "+977";

export function toNepalLocalPhone(value: string | null | undefined) {
  let digits = (value ?? "").replace(/\D/g, "");
  if (digits.startsWith("977") && digits.length > 10) digits = digits.slice(3);
  if (digits.startsWith("0") && digits.length > 10) digits = digits.slice(1);
  return digits.slice(0, 10);
}

export function toNepalInternationalPhone(localNumber: string) {
  return `${NEPAL_COUNTRY_CODE}${toNepalLocalPhone(localNumber)}`;
}
