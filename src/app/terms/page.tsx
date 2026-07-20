import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Draft terms governing use of the Rentle peer-to-peer rental marketplace in Nepal.",
};

export default function TermsPage() {
  return (
    <>
      <main className="page trust-page legal-page">
        <div className="container">
          <header className="trust-hero">
            <p className="eyebrow">Draft — pending legal review</p>
            <h1>Terms of Service</h1>
            <p>
              These draft terms describe the rules for using Rentle, a peer-to-peer
              marketplace for rentals and local services in Nepal.
            </p>
          </header>

          <article className="legal-document card">
            <p className="legal-document__meta">
              Proposed effective date: 20-07-2026 · Version: Draft 1.0
            </p>

            <section>
              <h2>1. About these terms</h2>
              <p>
                These Terms of Service (“Terms”) form an agreement between you and
                Rentle Pvt. Ltd. (registration pending) (“Rentle”, “we”, “us” or
                “our”). They apply when you access Rentle’s website, applications,
                communications and related marketplace services (the “Platform”).
              </p>
              <p>
                By creating an account or using the Platform, you agree to these Terms
                and our <Link href="/privacy">Privacy Policy</Link>. If you do not
                agree, do not use the Platform. Any mandatory rights available to you
                under Nepal law continue to apply.
              </p>
            </section>

            <section>
              <h2>2. Eligibility, accounts and verification</h2>
              <ul>
                <li>You must be at least 18 years old and legally able to enter a contract.</li>
                <li>You must provide accurate, current information and keep your account secure.</li>
                <li>You may not transfer your account or impersonate another person or organisation.</li>
                <li>
                  Booking or listing may require verified email, phone number and identity.
                  Identity checks may require citizenship-card images and related details.
                </li>
                <li>
                  Verification reduces some risks but is not an endorsement, guarantee of
                  identity, credit check or assurance that a user will perform a booking.
                </li>
              </ul>
              <p>
                You are responsible for activity under your account and must promptly
                report suspected unauthorised access to [support contact to be confirmed].
              </p>
            </section>

            <section>
              <h2>3. Rentle’s marketplace role</h2>
              <p>
                Rentle provides tools for users to publish listings, request and manage
                bookings, communicate, record deposit evidence and review completed
                exchanges. Unless expressly stated otherwise, Rentle is not the owner,
                renter, service provider, agent, insurer, bank, wallet provider, payment
                processor or party to the agreement between users.
              </p>
              <p>
                Users decide whether to transact and are responsible for checking a
                listing, the other user, item condition, service scope, dates, price,
                deposit, handover arrangements and legal compliance.
              </p>
            </section>

            <section>
              <h2>4. Listings and prohibited items</h2>
              <p>
                Listing owners must have the legal right and practical ability to provide
                the advertised item or service. Listings must be accurate, include known
                material defects or restrictions, and state the full price and deposit.
              </p>
              <p>You must not list, request, rent, supply or promote:</p>
              <ul>
                <li>illegal, stolen, counterfeit or unlawfully obtained goods;</li>
                <li>weapons, explosives, controlled substances or hazardous materials;</li>
                <li>items requiring a licence where the parties lack the required licence;</li>
                <li>unsafe, recalled or materially defective items;</li>
                <li>sexual services, trafficking, exploitation or discriminatory services;</li>
                <li>personal documents, financial accounts or another person’s identity data; or</li>
                <li>anything prohibited by Nepal law or Rentle’s published safety rules.</li>
              </ul>
              <p>
                Rentle may remove or restrict a listing while investigating safety,
                authenticity or legal concerns.
              </p>
            </section>

            <section>
              <h2>5. Booking lifecycle and user responsibilities</h2>
              <ol>
                <li>A renter sends a request for stated dates, price and terms.</li>
                <li>The owner accepts or declines. Acceptance creates a direct agreement between the users.</li>
                <li>The users confirm handover, condition, timing, service scope and any deposit directly.</li>
                <li>The users perform the rental or service and record relevant updates on the Platform.</li>
                <li>The booking is completed, any deposit is settled, and eligible users may leave a review.</li>
              </ol>
              <p>
                Keep material agreements and evidence in the booking conversation. Each
                user must inspect the item or confirm the service before handover and
                promptly record damage, delay, non-delivery or other problems.
              </p>
            </section>

            <section>
              <h2>6. Direct deposits and payments</h2>
              <p>
                Rental charges and deposits are handled directly between users, including
                through off-platform services such as eSewa or Khalti. Rentle does not
                hold, safeguard, receive or release those funds. A payment screenshot can
                be uploaded as evidence, but it is not confirmation that funds have
                cleared. Recipients must verify payment in their own account.
              </p>
              <p>
                Users are responsible for payment details, wallet fees, reversals,
                refunds, tax obligations and compliance with the payment provider’s
                terms. Never share a wallet password, PIN or one-time code. Any deposit
                deduction or return must be resolved directly between the users unless
                applicable law requires otherwise.
              </p>
            </section>

            <section>
              <h2>7. Cancellations, refunds and no-shows</h2>
              <p>
                Cancellations are governed by the cancellation terms shown during the
                booking flow, the listing terms accepted by both users and any mandatory
                rights under Nepal law. The final cancellation windows, consequences and
                exceptional-circumstance process remain [to be confirmed before launch].
              </p>
              <p>
                Because Rentle does not hold user funds, the paying and receiving users
                must arrange any refund directly and record it in the booking. Report a
                disputed cancellation or no-show through the booking report flow or at
                [support contact to be confirmed].
              </p>
            </section>

            <section>
              <h2>8. Fees and taxes</h2>
              <p>
                Rentle is free to use during the current launch period. We may introduce
                marketplace or service fees in the future, but we will provide advance
                notice and display applicable fees before they apply to a new transaction.
                A fee change will not retroactively alter an already accepted booking.
              </p>
              <p>
                Users are responsible for determining and paying taxes, duties, permit
                charges or other amounts arising from their activity.
              </p>
            </section>

            <section>
              <h2>9. Conduct, communications and reviews</h2>
              <p>
                You must communicate honestly, respect other users’ safety and property,
                and use personal information only to complete the relevant booking. You
                must not harass users, manipulate reviews, evade enforcement, send spam,
                scrape the Platform, introduce malicious code or use Rentle for fraud.
              </p>
              <p>
                Reviews must reflect a genuine completed booking. Rentle may remove
                content that is fraudulent, irrelevant, abusive, unlawful or exposes
                sensitive personal information.
              </p>
            </section>

            <section>
              <h2>10. Safety, damage and insurance</h2>
              <p>
                Users assume the ordinary risks of meeting, handing over property and
                providing or receiving services. Follow manufacturer guidance, use
                suitable protective equipment and do not proceed if an exchange appears
                unsafe. Rentle does not currently provide insurance or a damage guarantee.
                Users should obtain any insurance appropriate to the item or service.
              </p>
            </section>

            <section>
              <h2>11. Reports and disputes</h2>
              <p>
                First contact the other user through the booking conversation and preserve
                messages, photographs, receipts, payment records and handover evidence. If
                the issue is not resolved, use the Platform’s report process or contact
                [support contact to be confirmed] with the booking reference.
              </p>
              <p>
                Rentle may review available records, request information, restrict an
                account or suggest next steps, but is not required to decide private legal
                claims or compel a user to pay. For suspected crime, immediate danger or
                material loss, contact the appropriate Nepal authorities. We may cooperate
                with a lawful investigation.
              </p>
            </section>

            <section>
              <h2>12. Suspension and termination</h2>
              <p>
                Rentle may warn, limit, suspend or terminate an account or listing where
                reasonably necessary to address a Terms breach, safety risk, fraud,
                unlawful activity, repeated cancellations, non-payment, harmful conduct
                or a lawful request. Where appropriate, we will give notice and an
                opportunity to respond. Users remain responsible for obligations from
                bookings made before restriction or termination.
              </p>
            </section>

            <section>
              <h2>13. Platform content and intellectual property</h2>
              <p>
                You retain ownership of content you submit. You grant Rentle a
                non-exclusive, worldwide, royalty-free licence to host, reproduce, adapt
                and display that content only as needed to operate, secure and promote the
                Platform. You confirm that you have the rights needed to grant this
                licence. Rentle’s software, branding and original materials remain owned
                by Rentle or its licensors.
              </p>
            </section>

            <section>
              <h2>14. Disclaimers and limitation of liability</h2>
              <p>
                To the extent permitted by law, the Platform is provided “as is” and “as
                available”. Rentle does not guarantee uninterrupted access, user conduct,
                listing quality, legal compliance, payment, identity, availability or the
                outcome of a transaction.
              </p>
              <p>
                To the extent permitted by Nepal law, Rentle will not be liable for
                indirect, incidental, special, punitive or consequential loss, lost profit
                or lost data, or for loss arising from a user’s item, service, payment,
                deposit, meeting or conduct. Rentle’s aggregate liability for a claim will
                not exceed [liability cap and calculation period to be confirmed], except
                where liability cannot lawfully be excluded or limited.
              </p>
            </section>

            <section>
              <h2>15. Indemnity</h2>
              <p>
                To the extent permitted by law, you will be responsible for losses and
                reasonable costs incurred by Rentle due to your unlawful conduct, your
                content, your breach of these Terms or your infringement of another
                person’s rights. [Scope and procedure require legal confirmation.]
              </p>
            </section>

            <section>
              <h2>16. Governing law and general terms</h2>
              <p>
                These Terms are governed by the laws of Nepal. Subject to any mandatory
                dispute forum or consumer right, disputes will be submitted to the courts
                of [venue in Nepal to be confirmed]. Before filing, the parties should
                attempt good-faith resolution for at least [30] days.
              </p>
              <p>
                If part of these Terms is unenforceable, the remaining terms continue.
                Delay in enforcement is not a waiver. You may not assign these Terms
                without our consent; Rentle may assign them as part of a lawful business
                transfer. These Terms, the Privacy Policy and booking-specific terms form
                the relevant agreement concerning the Platform.
              </p>
            </section>

            <section>
              <h2>17. Changes and contact</h2>
              <p>
                We may update these Terms for legal, safety or product reasons. We will
                post the revised version and provide reasonable notice of material changes.
                Continued use after the effective date means you accept the revised Terms.
              </p>
              <address>
                Rentle Pvt. Ltd. (registration pending)<br />
                Registered address: [to be inserted]<br />
                Support and legal notices: [contact to be confirmed]
              </address>
            </section>
          </article>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
