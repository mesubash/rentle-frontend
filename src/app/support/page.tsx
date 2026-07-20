import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Support & help — Rentle",
  description:
    "Get help with your Rentle account, verification, bookings, deposits and disputes, and find out how to reach the Rentle team.",
};

const SUPPORT_EMAIL = "support@rentle.online";

const topics = [
  {
    label: "Verification",
    title: "My verification is still pending",
    copy: "Citizenship verification is reviewed by a person, usually within a day or two. You can keep browsing while you wait; listing and booking become available after approval.",
    href: "/verification",
    action: "Check verification",
  },
  {
    label: "Deposits",
    title: "My deposit has not been returned",
    copy: "Deposits move directly between renter and owner. Start in the booking conversation so the agreement stays on record. If you cannot resolve it together, send us the booking link and we will review the trail.",
    href: "/bookings",
    action: "Find the booking",
  },
  {
    label: "Safety",
    title: "I need to report a listing or person",
    copy: "Send us the listing, profile, or booking link and explain what looked wrong. We review suspected fraud, unsafe behaviour, and policy violations, then take action where the record supports it.",
    href: `mailto:${SUPPORT_EMAIL}?subject=Report%20on%20Rentle`,
    action: "Email a report",
  },
];

export default function SupportPage() {
  return (
    <>
      <main className="support-page">
        <section className="support-hero">
          <div className="container support-hero__layout">
            <div>
              <p className="eyebrow">Rentle support</p>
              <h1>When something feels stuck, talk to us.</h1>
              <p>
                Verification, deposits, and disagreements sometimes need a person—not
                another automated answer. Tell us what happened and we will look at the
                record with you.
              </p>
            </div>

            <aside className="support-contact">
              <Mail size={24} aria-hidden="true" />
              <p>Write to the Rentle team</p>
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
              <span>
                Include your account phone number and the listing or booking link. We
                aim to reply within two working days.
              </span>
            </aside>
          </div>
        </section>

        <div className="container">
          <section className="support-guide" aria-labelledby="support-guide-title">
            <header>
              <p className="eyebrow">Start with the issue</p>
              <h2 id="support-guide-title">The questions we hear most often.</h2>
            </header>

            <div className="support-guide__list">
              {topics.map(({ label, title, copy, href, action }, index) => (
                <article key={label}>
                  <span className="support-guide__num" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="support-guide__label">{label}</p>
                  <div>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                    <Link className="about-text-link" href={href}>
                      {action} <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="support-prepare">
            <div>
              <p className="eyebrow">Before you write</p>
              <h2>A little context helps us help you faster.</h2>
            </div>
            <ol>
              <li>
                <span>1</span>
                <p><strong>Share the right link.</strong> Send the booking, listing, or profile involved.</p>
              </li>
              <li>
                <span>2</span>
                <p><strong>Tell us what happened.</strong> Include what you expected and what happened instead.</p>
              </li>
              <li>
                <span>3</span>
                <p><strong>Keep secrets private.</strong> Never email your password, OTP, wallet PIN, or full payment credentials.</p>
              </li>
            </ol>
          </section>

          <section className="support-grievance">
            <p className="eyebrow">Consumer grievance channel</p>
            <div>
              <h2>If the first answer does not resolve it, say so.</h2>
              <p>
                Reply to the same email and ask for the decision to be reviewed. Keeping
                the conversation in one thread helps the next person understand the full
                history without making you start over.
              </p>
              <a className="about-text-link" href={`mailto:${SUPPORT_EMAIL}?subject=Grievance%20review%20request`}>
                Request a review <ArrowRight size={15} />
              </a>
            </div>
          </section>

          <nav className="support-reading" aria-label="Support policies and guidance">
            <p>More about how Rentle works</p>
            <div>
              <Link href="/trust">Trust and safety <ArrowRight size={14} /></Link>
              <Link href="/terms">Terms of use <ArrowRight size={14} /></Link>
              <Link href="/privacy">Privacy policy <ArrowRight size={14} /></Link>
            </div>
          </nav>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
