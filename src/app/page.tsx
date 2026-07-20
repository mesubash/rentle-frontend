import Link from "next/link";
import { ArrowRight, CalendarCheck, PackageSearch, WalletCards } from "lucide-react";
import { ExploreMarketplace } from "@/components/explore-marketplace";
import { SiteFooter } from "@/components/site-footer";

const steps = [
  {
    icon: PackageSearch,
    title: "Find it nearby",
    copy: "Browse verified items and local services, with the deposit stated up front.",
  },
  {
    icon: CalendarCheck,
    title: "Request your dates",
    copy: "The owner approves first — every booking opens its own conversation.",
  },
  {
    icon: WalletCards,
    title: "Pay the owner directly",
    copy: "Deposits go owner-to-renter via eSewa or Khalti, with proof attached to the booking.",
  },
];

export default function HomePage() {
  return (
    <>
      <ExploreMarketplace home />
      <section className="page landing-steps">
        <div className="container">
          <div className="about-steps">
            <div className="section-heading">
              <p className="eyebrow">How Rentle works</p>
              <h2>Three steps from request to handover.</h2>
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
            <p className="landing-steps__more">
              <Link href="/about">How Rentle keeps both sides safe <ArrowRight size={15} /></Link>
            </p>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
