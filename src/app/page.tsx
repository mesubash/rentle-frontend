import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ExploreMarketplace } from "@/components/explore-marketplace";
import { SiteFooter } from "@/components/site-footer";

const steps = [
  {
    title: "Find it nearby",
    copy: "Browse verified items and local services, with the deposit stated up front.",
  },
  {
    title: "Request your dates",
    copy: "The owner approves first — every booking opens its own conversation.",
  },
  {
    title: "Pay the owner directly",
    copy: "Deposits go owner-to-renter via eSewa or Khalti, with proof attached to the booking.",
  },
];

export default function HomePage() {
  return (
    <>
      <Suspense fallback={null}><ExploreMarketplace home /></Suspense>
      <section className="page landing-steps">
        <div className="container">
          <div className="about-steps">
            <div className="landing-steps__heading">
              <div>
                <p className="eyebrow">How Rentle works</p>
                <h2>Three steps from request to handover.</h2>
              </div>
              <p className="landing-steps__intro">
                You deal with a real person nearby. Rentle keeps the request,
                conversation, and payment proof together.
              </p>
            </div>
            <ol className="landing-process">
              {steps.map(({ title, copy }, index) => (
                <li key={title} className="landing-process__step">
                  <span className="landing-process__num" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                </li>
              ))}
            </ol>
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
