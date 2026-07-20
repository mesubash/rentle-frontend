import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  MessageCircle,
  PackageSearch,
  ShieldCheck,
  Star,
  WalletCards,
} from "lucide-react";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "About Rentle",
  description:
    "Rentle is a peer-to-peer marketplace for renting things and booking local services across Nepal, built on a shared trust layer.",
};

const steps = [
  {
    icon: PackageSearch,
    title: "List or find",
    copy: "Owners list a product to rent or a service to offer. Renters search by category and city and open a listing.",
  },
  {
    icon: CalendarCheck,
    title: "Request & approve",
    copy: "The renter requests dates; the owner approves or declines. An approval opens a booking-scoped conversation.",
  },
  {
    icon: WalletCards,
    title: "Deposit, direct",
    copy: "If a deposit is set, the renter pays the owner via eSewa or Khalti and uploads proof. The owner confirms after checking their own account.",
  },
  {
    icon: Star,
    title: "Complete & review",
    copy: "After the rental or service, either side marks it complete and both leave a review — building a reputation that carries forward.",
  },
];

const principles = [
  {
    icon: ShieldCheck,
    title: "Everyone is a real person",
    copy: "Email, phone and citizenship are verified before anyone can book or list. Each signal is shown separately so you know what was actually checked.",
  },
  {
    icon: MessageCircle,
    title: "Everything stays on record",
    copy: "Dates, deposits, proof, messages and confirmations all attach to one booking — so there is a clear trail if something goes wrong.",
  },
  {
    icon: PackageSearch,
    title: "One place for things and help",
    copy: "A camera for a wedding and the photographer to run it live under the same listing model, the same trust layer, and the same booking flow.",
  },
];

export default function AboutPage() {
  return (
    <>
      <main className="page trust-page">
        <div className="container">
          <header className="trust-hero">
            <p className="eyebrow">About Rentle</p>
            <h1>Rent, lend and hire — with people you can trust.</h1>
            <p>
              Rentle is a peer-to-peer marketplace for Nepal. Rent a camera or a saree,
              or book a mover or a photographer — from verified people nearby, with
              deposits, reviews and a record of what was agreed.
            </p>
          </header>

          <section className="trust-example card">
            <div>
              <ShieldCheck size={28} />
              <div>
                <strong>Why we built it</strong>
                <span>
                  Renting a camera or hiring a mover in Nepal usually happens through
                  WhatsApp groups and Facebook posts — no verification, no shared record,
                  no recourse when something goes wrong.
                </span>
              </div>
            </div>
            <p>
              Rentle brings that everyday exchange into one trusted place: verified
              profiles, deposits tracked in the open, dual-sided reviews, and messages
              tied to each booking. Trust is not a feature here — it is the product.
            </p>
          </section>

          <section className="about-steps">
            <div className="section-heading">
              <p className="eyebrow">How Rentle works</p>
              <h2>From listing to review, in four steps.</h2>
            </div>
            <div className="trust-points">
              {steps.map(({ icon: Icon, title, copy }, index) => (
                <article key={title} className="card about-step">
                  <span className="about-step__num">{index + 1}</span>
                  <Icon />
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="about-steps">
            <div className="section-heading">
              <p className="eyebrow">What makes it different</p>
              <h2>Built around trust between strangers.</h2>
            </div>
            <div className="trust-points">
              {principles.map(({ icon: Icon, title, copy }) => (
                <article key={title} className="card">
                  <Icon />
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="deposit-explainer">
            <WalletCards />
            <div>
              <p className="eyebrow">Payments</p>
              <h2>Money moves directly. The evidence stays here.</h2>
              <p>
                Rentle records the agreed amount, the deposit proof and the confirmations,
                but never holds your money — you pay the owner directly and both sides keep
                the receipt. Always confirm condition, timing and payment yourself.
              </p>
            </div>
          </section>

          <section className="about-cta card">
            <div>
              <h2>Ready to start?</h2>
              <p>Browse what neighbours are offering, or list something of your own.</p>
            </div>
            <div className="about-cta__actions">
              <Link className="button" href="/explore">Explore listings <ArrowRight size={16} /></Link>
              <Link className="button button--secondary" href="/register">Create an account</Link>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
