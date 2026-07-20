import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "About Rentle",
  description:
    "Rentle is a peer-to-peer marketplace for renting things and booking local services across Nepal, built on a shared trust layer.",
};

const steps = [
  {
    title: "Find what is nearby",
    copy: "Browse useful things and local services, with the price and any deposit shown before you request.",
  },
  {
    title: "Agree with the owner",
    copy: "Choose your dates, send a request, and use the booking conversation to settle the handover details.",
  },
  {
    title: "Pay them directly",
    copy: "Send any agreed deposit through eSewa or Khalti. The proof and confirmation stay with the booking.",
  },
  {
    title: "Return and review",
    copy: "Complete the exchange and leave an honest review. Each good handover makes the next one easier.",
  },
];

const principles = [
  {
    label: "Real people",
    title: "Know who you are dealing with.",
    copy: "Email, phone, and identity checks are shown separately. You can see what has actually been verified before deciding.",
  },
  {
    label: "A shared record",
    title: "Keep the agreement in one place.",
    copy: "Dates, messages, deposit proof, and confirmations belong to the booking—not across screenshots and scattered chats.",
  },
  {
    label: "Useful, not idle",
    title: "Get more from what already exists.",
    copy: "A tool, camera, spare vehicle, or practical skill can help someone nearby and earn for its owner at the same time.",
  },
];

export default function AboutPage() {
  return (
    <>
      <main className="about-page">
        <section className="about-hero">
          <div className="container about-hero__layout">
            <div className="about-hero__copy">
              <p className="eyebrow">About Rentle</p>
              <h1>Useful things are already nearby.</h1>
              <p>
                Rentle helps people across Nepal rent what they need, earn from
                what they own, and book trusted local help—without treating every
                exchange like a purchase from a faceless shop.
              </p>
              <div className="about-hero__actions">
                <Link className="button" href="/explore">
                  See what is nearby <ArrowRight size={16} />
                </Link>
                <Link className="about-text-link" href="/list">
                  List something of yours
                </Link>
              </div>
            </div>

            <aside className="about-vignette" aria-label="An example of a local exchange">
              <p className="about-vignette__label">Picture a Saturday in the valley</p>
              <p>
                A camera sits unused in Lalitpur. Someone in Bhaktapur needs one
                for a family gathering—but not forever.
              </p>
              <strong>One person earns. One person avoids buying. The camera gets used.</strong>
            </aside>
          </div>
        </section>

        <div className="container">
          <section className="about-story">
            <p className="eyebrow">Why we are building it</p>
            <div className="about-story__body">
              <h2>Renting here already happens. The trust layer is what is missing.</h2>
              <div className="about-story__copy">
                <p>
                  People find cameras, rooms, tools, vehicles, and local help through
                  friends, Facebook posts, and chat groups every day. It works—until
                  the listing is unclear, the person is anonymous, or nobody remembers
                  exactly what was agreed.
                </p>
                <p>
                  Rentle gives that familiar person-to-person exchange a proper home:
                  a clear listing, visible verification, one booking record, and a
                  reputation that follows both sides.
                </p>
              </div>
              <blockquote>
                We are not trying to replace the neighbourly exchange. We are trying
                to make it easier to trust.
              </blockquote>
            </div>
          </section>

          <section className="about-process" aria-labelledby="about-process-title">
            <header className="about-section-heading">
              <div>
                <p className="eyebrow">How it works</p>
                <h2 id="about-process-title">From a need to a handover.</h2>
              </div>
              <p>No checkout maze. Just a clear agreement between two people.</p>
            </header>

            <ol className="about-process__list">
              {steps.map(({ title, copy }, index) => (
                <li key={title}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="about-principles" aria-labelledby="about-principles-title">
            <header>
              <p className="eyebrow">What matters here</p>
              <h2 id="about-principles-title">Trust should be visible, not assumed.</h2>
            </header>
            <div className="about-principles__list">
              {principles.map(({ label, title, copy }) => (
                <article key={label}>
                  <p>{label}</p>
                  <h3>{title}</h3>
                  <span>{copy}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="about-payment-note">
            <p className="eyebrow">A clear boundary</p>
            <div>
              <h2>Your money stays between you and the owner.</h2>
              <p>
                Rentle records the agreed deposit, payment proof, and confirmation,
                but does not hold the money. You pay the owner directly and check the
                condition, timing, and payment together.
              </p>
              <Link className="about-text-link" href="/trust">
                Read how Rentle keeps both sides safe <ArrowRight size={15} />
              </Link>
            </div>
          </section>

          <section className="about-cta about-cta--editorial">
            <p className="eyebrow">Start nearby</p>
            <div>
              <h2>Need something—or have something sitting idle?</h2>
              <p>See what people are offering, or put something useful back into circulation.</p>
            </div>
            <div className="about-cta__actions">
              <Link className="button" href="/explore">
                Explore Rentle <ArrowRight size={16} />
              </Link>
              <Link className="button button--secondary" href="/register">
                Join Rentle
              </Link>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
