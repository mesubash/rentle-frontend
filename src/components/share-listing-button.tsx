"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

export function ShareListingButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    if (navigator.share) await navigator.share({ title, text: `${title} is available on Rentle.`, url: window.location.href });
    else { await navigator.clipboard.writeText(window.location.href); setCopied(true); window.setTimeout(() => setCopied(false), 2200); }
  }
  return <button className="button button--secondary" onClick={share}>{copied ? <><Check size={17} /> Link copied</> : <><Share2 size={17} /> Share listing</>}</button>;
}
