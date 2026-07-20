import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Trust and safety — Rentle",
  description:
    "Understand Rentle verification, booking records, reviews, direct deposits, and the checks to make before an exchange.",
};

const signals = [
  {
    label: "Identity",
    title: "See what was actually checked.",
    copy: "Phone verification and citizenship review appear as separate signals. One does not silently stand in for the other.",
  },
  {
    label: "Agreement",
    title: "Keep the important details together.",
    copy: "Dates, the agreed deposit, uploaded proof, and both confirmations stay attached to the booking.",
  },
  {
    label: "Conversation",
    title: "Make changes where both people can see them.",
    copy: "Booking messages retain the listing and date context, so a changed handover time is not lost in another chat.",
  },
  {
    label: "Reputation",
    title: "Reviews come from completed exchanges.",
    copy: "Only people who took part in a completed booking can review each other. The history grows through real activity.",
  },
];

const renterChecks = [
  "Compare the item with its current photos and description.",
  "Ask about existing wear, what is included, and the return time.",
  "Keep any changed dates or conditions in the booking conversation.",
];

const ownerChecks = [
  "Check the money in your own wallet or bank account—not only a screenshot.",
  "Confirm the item condition together before it leaves your hands.",
  "Do not share an OTP, wallet PIN, password, or full payment credentials.",
];

export default function TrustPage() {
  return (
    <>
      <main className="trust-story-page">
        <section className="trust-story-hero">
          <div className="container trust-story-hero__layout">
            <div>
              <p className="eyebrow">Trust at Rentle</p>
              <h1>Trust is not one badge.</h1>
              <p>
                A verified identity says one thing. A completed booking says another.
                Rentle keeps those signals separate so you can make your own decision
                with better context.
              </p>
            </div>

            <aside className="trust-boundary">
              <div>
                <p>Rentle can show</p>
                <strong>Identity checks, past activity, reviews, messages, and the booking record.</strong>
              </div>
              <div>
                <p>Rentle cannot promise</p>
                <strong>An item&rsquo;s current condition, someone&rsquo;s punctuality, or that uploaded proof means money arrived.</strong>
              </div>
            </aside>
          </div>
        </section>

        <div className="container">
          <section className="trust-signals" aria-labelledby="trust-signals-title">
            <header>
              <p className="eyebrow">Read the evidence</p>
              <h2 id="trust-signals-title">One signal at a time.</h2>
              <p>
                No single check makes an exchange risk-free. Together, these signals
                help both people understand who they are dealing with and what was agreed.
              </p>
            </header>

            <div className="trust-signals__list">
              {signals.map(({ label, title, copy }, index) => (
                <article key={label}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <p>{label}</p>
                  <div>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="trust-handover" aria-labelledby="trust-handover-title">
            <header>
              <p className="eyebrow">At the handover</p>
              <h2 id="trust-handover-title">Pause, check, then confirm.</h2>
              <p>A few careful minutes protect both sides better than assumptions do.</p>
            </header>

            <div className="trust-handover__columns">
              <section>
                <p>When you are renting</p>
                <ol>
                  {renterChecks.map((check, index) => (
                    <li key={check}><span>{index + 1}</span>{check}</li>
                  ))}
                </ol>
              </section>
              <section>
                <p>When you are lending</p>
                <ol>
                  {ownerChecks.map((check, index) => (
                    <li key={check}><span>{index + 1}</span>{check}</li>
                  ))}
                </ol>
              </section>
            </div>
          </section>

          <section className="trust-payment">
            <p className="eyebrow">Direct deposits</p>
            <div>
              <h2>The money moves between people. The evidence stays here.</h2>
              <p>
                After approval, the renter pays the owner directly through the agreed
                method and uploads proof. The owner checks their own account before
                confirming. Rentle records the amount and actions but does not hold or
                release the money.
              </p>
            </div>
          </section>

          <section className="trust-report">
            <div>
              <p className="eyebrow">Something does not look right?</p>
              <h2>Stop before the handover and tell us.</h2>
              <p>
                Keep the listing, profile, or booking link. A clear record helps the
                Rentle team review suspected fraud, unsafe behaviour, and disputes.
              </p>
            </div>
            <Link className="button" href="/support">
              Contact support <ArrowRight size={16} />
            </Link>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
