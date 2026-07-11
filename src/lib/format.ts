export function formatNpr(value: number) {
  return `NPR ${new Intl.NumberFormat("en-NP", { maximumFractionDigits: 2 }).format(value)}`;
}
