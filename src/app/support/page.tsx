import type { Metadata } from "next";
import Link from "next/link";
import { LifeBuoy, Mail, MessageCircle, ShieldAlert } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Support & help — Rentle",
  description:
    "Get help with your Rentle account, verification, bookings, deposits and disputes, and find out how to reach the Rentle team.",
};

// Placeholder until the real support channel is confirmed. Kept in one place so the
// footer and this page can be updated together.
const SUPPORT_EMAIL = "support@rentle.example";

const topics = [
  {
    icon: ShieldAlert,
    title: "Verification is pending",
    copy: "Citizenship verification is reviewed by a person, usually within a day or two. You will be notified when it is approved. You can browse while you wait; listing and booking unlock once verified.",
  },
  {
    icon: MessageCircle,
    title: "A deposit was not returned",
    copy: "Deposits are paid directly between renter and owner and returned the same way. Use the booking's messages to coordinate. If it is unresolved, contact us with the booking details and we will help mediate.",
  },
  {
    icon: LifeBuoy,
    title: "Report a listing, user or booking",
    copy: "If something looks fraudulent or unsafe, contact us with the listing or booking link and a short description. Suspended accounts and removed listings are handled by our team.",
  },
];

export default function SupportPage() {
  return (
    <>
      <main className="page trust-page">
        <div className="container">
          <header className="trust-hero">
            <p className="eyebrow">Support</p>
            <h1>Help when you need it.</h1>
            <p>
              Rentle keeps a person in the loop for verification, deposits and disputes.
              If something is stuck or does not look right, here is how to get it sorted.
            </p>
          </header>

          <section className="trust-example card">
            <div>
              <Mail size={28} />
              <div>
                <strong>Contact the Rentle team</strong>
                <span>
                  Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with your
                  account phone number and, if it is about a booking, the booking link.
                  We aim to reply within two working days.
                </span>
              </div>
            </div>
            <p>
              This is also Rentle&rsquo;s consumer grievance channel. If you are not
              satisfied with an outcome, say so in your message and we will escalate it
              for review.
            </p>
          </section>

          <section className="about-steps">
            <div className="section-heading">
              <p className="eyebrow">Common questions</p>
              <h2>Quick answers to the things people ask most.</h2>
            </div>
            <div className="trust-points">
              {topics.map(({ icon: Icon, title, copy }) => (
                <article key={title} className="card about-step">
                  <Icon />
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="trust-example card">
            <p>
              Looking for how Rentle protects you? Read{" "}
              <Link href="/trust">how trust works</Link>, or review our{" "}
              <Link href="/terms">Terms</Link> and{" "}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
