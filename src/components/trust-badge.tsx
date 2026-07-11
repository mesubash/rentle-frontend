import { ShieldCheck } from "lucide-react";

export function TrustBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span className={compact ? "trust-badge trust-badge--compact" : "trust-badge"}>
      <ShieldCheck aria-hidden="true" size={compact ? 14 : 16} />
      Verified
    </span>
  );
}
