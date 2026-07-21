export function formatNpr(value: number) {
  return `NPR ${new Intl.NumberFormat("en-NP", { maximumFractionDigits: 2 }).format(value)}`;
}

/** "DEPOSIT_PENDING" -> "Deposit pending". */
export function humanize(value: string) {
  return value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

/** "Bikash Sharma" -> "BS". Used for avatar fallbacks. */
export function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}
