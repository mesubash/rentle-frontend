import { CheckCircle2, ClipboardCheck, MessageCircle, ShieldCheck, Star, WalletCards } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";

const points = [
  { icon: ShieldCheck, title: "Identity signals", copy: "Phone verification and citizenship review are shown separately, so you can tell what has actually been checked." },
  { icon: ClipboardCheck, title: "Recorded agreements", copy: "Dates, deposit amounts, proof, and confirmations stay attached to one booking." },
  { icon: MessageCircle, title: "Booking-only messages", copy: "Conversations open after approval and retain the listing and date context." },
  { icon: Star, title: "Earned reviews", copy: "Only participants in a completed booking can leave a review." },
];

export default function TrustPage() {
  return <><main className="page trust-page"><div className="container"><header className="trust-hero"><p className="eyebrow">Trust at Rentle</p><h1>Evidence from real marketplace activity.</h1><p>Trust signals combine verified identity with completed bookings and reviews. They are context, not a guarantee—confirm condition, timing, and payment details yourself.</p></header><section className="trust-example card"><div><ShieldCheck size={28} /><div><strong>Read each signal on its own</strong><span>Phone, citizenship, activity, and reviews answer different questions.</span></div></div><ul><li><CheckCircle2 /> Check current photos and description</li><li><CheckCircle2 /> Keep changes in booking messages</li><li><CheckCircle2 /> Verify money in your own account</li></ul></section><div className="trust-points">{points.map(({ icon: Icon, title, copy }) => <article key={title} className="card"><Icon /><h2>{title}</h2><p>{copy}</p></article>)}</div><section className="deposit-explainer"><WalletCards /><div><p className="eyebrow">Direct deposits</p><h2>Money moves directly. The evidence stays here.</h2><p>After approval, the renter pays the owner and uploads proof. The owner checks their own account before confirming. Rentle records the agreed amount and actions but does not hold the money.</p></div></section></div></main><SiteFooter /></>;
}
