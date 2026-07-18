"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

export function ShareListingButton({ listingId, title }: { listingId: string; title: string }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const url = `${window.location.origin}/listing/${listingId}`;
    if (navigator.share) await navigator.share({ title, text: `${title} is available on Rentle.`, url });
    else { await navigator.clipboard.writeText(url); setCopied(true); window.setTimeout(() => setCopied(false), 2200); }
  }
  return <button type="button" className="button button--secondary" onClick={share}>{copied ? <><Check size={17} /> Link copied</> : <><Share2 size={17} /> Share listing</>}</button>;
}
