import { ShieldCheck } from "lucide-react";

export function TrustBadge({ compact = false, verified = true }: { compact?: boolean; verified?: boolean }) {
  return (
    <span className={compact ? "trust-badge trust-badge--compact" : "trust-badge"}>
      <ShieldCheck aria-hidden="true" size={compact ? 14 : 16} />
      {verified ? "Verified" : "Not verified"}
    </span>
  );
}
