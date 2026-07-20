import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Draft privacy policy for the Rentle peer-to-peer rental marketplace in Nepal.",
};

export default function PrivacyPage() {
  return (
    <>
      <main className="page trust-page legal-page">
        <div className="container">
          <header className="trust-hero">
            <p className="eyebrow">Draft — pending legal review</p>
            <h1>Privacy Policy</h1>
            <p>
              This draft explains how Rentle collects, uses, retains and shares personal
              information when people use our marketplace in Nepal.
            </p>
          </header>

          <article className="legal-document card">
            <p className="legal-document__meta">
              Proposed effective date: 20-07-2026 · Version: Draft 1.0
            </p>

            <section>
              <h2>1. Who is responsible for your information</h2>
              <p>
                Rentle Pvt. Ltd. (registration pending) (“Rentle”, “we”, “us” or “our”)
                operates the Rentle peer-to-peer marketplace and is responsible for the
                personal information described in this policy. Our registered address and
                privacy contact details are [to be confirmed before launch].
              </p>
              <p>
                This policy should be read with our <Link href="/terms">Terms of Service</Link>.
                It applies to visitors, account holders, listing owners, renters and service users.
              </p>
            </section>

            <section>
              <h2>2. Information we collect</h2>
              <h3>Account and contact information</h3>
              <p>
                Name, email address, phone number, password credentials in protected form,
                profile photograph, account status and communication preferences.
              </p>

              <h3>Identity and verification information</h3>
              <p>
                Citizenship-card images and details such as legal name, citizenship number,
                date of birth, issue district, family details, address and occupation; phone
                and email verification status; KYC submission, review and decision records.
                Citizenship documents are sensitive and receive restricted handling.
              </p>

              <h3>Marketplace and booking information</h3>
              <p>
                Listings, descriptions, photographs, prices, availability, booking dates,
                deposits, cancellations, completion records, reviews, reports, and messages
                or support communications connected with marketplace activity.
              </p>

              <h3>Direct-payment evidence</h3>
              <p>
                Payment screenshots, transaction references, wallet provider names, amounts
                and confirmation status uploaded for off-platform eSewa, Khalti or similar
                transfers. Rentle does not need or request wallet passwords, PINs or one-time
                codes. Users should redact unrelated balances and transactions before upload.
              </p>

              <h3>Device and usage information</h3>
              <p>
                IP address, browser and device details, access times, pages viewed, referring
                pages, security events, cookie or session identifiers, and diagnostic logs.
                [Cookie inventory and analytics providers to be confirmed.]
              </p>

              <h3>Information from other sources</h3>
              <p>
                Information received from sign-in providers, other users involved in a
                booking, service providers, public authorities and fraud or safety reports,
                where permitted by law.
              </p>
            </section>

            <section>
              <h2>3. Why we use personal information</h2>
              <ul>
                <li>create, authenticate and administer accounts;</li>
                <li>verify phone numbers, email addresses and identity;</li>
                <li>publish listings and enable searches, bookings, messages and reviews;</li>
                <li>record direct-payment evidence and booking confirmations;</li>
                <li>provide support and communicate service or policy updates;</li>
                <li>detect fraud, abuse, prohibited listings and threats to user safety;</li>
                <li>investigate reports, enforce our Terms and establish or defend legal claims;</li>
                <li>maintain, troubleshoot and improve the Platform; and</li>
                <li>comply with applicable legal, regulatory and accounting obligations.</li>
              </ul>
              <p>
                We process information with consent where required, to provide the service
                you request, to meet legal obligations, and for legitimate safety and
                operational purposes recognised by applicable Nepal law. [The final policy
                must map each purpose to the applicable legal basis.]
              </p>
            </section>

            <section>
              <h2>4. When we share information</h2>
              <p>We may share only what is reasonably necessary with:</p>
              <ul>
                <li>
                  <strong>Other users:</strong> profile, verification indicators, listings,
                  reviews and booking details needed to arrange an exchange. Citizenship
                  images and citizenship numbers are not shown to other marketplace users.
                </li>
                <li>
                  <strong>Service providers:</strong> hosting, storage, email, SMS, identity
                  review, authentication, security, customer support and analytics providers
                  acting under appropriate instructions and confidentiality commitments.
                  [Provider list and processing locations to be inserted.]
                </li>
                <li>
                  <strong>Professional advisers and transaction parties:</strong> lawyers,
                  auditors, insurers, and participants in a proposed financing, merger or
                  business transfer, subject to appropriate safeguards.
                </li>
                <li>
                  <strong>Law enforcement and public authorities:</strong> where disclosure
                  is required by a valid legal process or lawful request, or is reasonably
                  necessary to protect rights, safety and prevent serious harm, as permitted by law.
                </li>
              </ul>
              <p>
                We do not sell personal information. eSewa, Khalti and other payment
                providers process direct transfers under their own privacy terms; Rentle
                does not control those services.
              </p>
            </section>

            <section>
              <h2>5. International processing</h2>
              <p>
                Some infrastructure or service providers may process information outside
                Nepal. Before such processing begins, Rentle will identify the relevant
                locations and put in place any notice, consent, contract or other safeguard
                required by Nepal law. [Hosting region and transfer mechanism to be confirmed.]
              </p>
            </section>

            <section>
              <h2>6. Retention</h2>
              <p>
                We retain information only for as long as needed for the purposes described
                above, including account operation, fraud prevention, dispute handling and
                legal compliance. Proposed periods requiring legal and operational approval are:
              </p>
              <div className="legal-table-wrap">
                <table>
                  <thead>
                    <tr><th>Record</th><th>Proposed retention rule</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>Account and profile</td><td>While active, then [period] after closure.</td></tr>
                    <tr><td>Citizenship images and KYC data</td><td>Until verification plus [period], unless longer retention is legally required.</td></tr>
                    <tr><td>Bookings, messages and reviews</td><td>[Period] after booking completion or account closure.</td></tr>
                    <tr><td>Payment screenshots and deposit records</td><td>[Period] after the related booking or dispute closes.</td></tr>
                    <tr><td>Reports, disputes and enforcement records</td><td>Until final resolution plus [limitation period].</td></tr>
                    <tr><td>Security and access logs</td><td>[Period], extended where needed to investigate an incident.</td></tr>
                  </tbody>
                </table>
              </div>
              <p>
                We may retain a minimal record longer where required by law, necessary to
                protect users, or needed to establish or defend a legal claim. Data may be
                deleted or irreversibly anonymised when the applicable period ends.
              </p>
            </section>

            <section>
              <h2>7. Security</h2>
              <p>
                We use administrative, technical and physical measures designed to protect
                personal information, including access controls, restricted KYC access,
                secure transmission, monitoring and backups where appropriate. No system is
                completely secure. Users must protect their passwords and report suspected
                account compromise promptly. [Security controls and incident-notification
                process to be validated before publication.]
              </p>
            </section>

            <section>
              <h2>8. Your choices and rights</h2>
              <p>
                Subject to applicable Nepal law and necessary identity checks, you may ask to:
              </p>
              <ul>
                <li>access information Rentle holds about you;</li>
                <li>correct inaccurate or incomplete information;</li>
                <li>delete information or close your account;</li>
                <li>withdraw consent where processing depends on consent;</li>
                <li>object to or restrict certain processing; and</li>
                <li>receive information about sharing or make a privacy complaint.</li>
              </ul>
              <p>
                Some requests may be limited where retention or processing is required for
                security, another person’s rights, an unresolved booking, a legal claim or
                compliance with law. To submit a request, contact [privacy contact to be
                confirmed]. We will explain any identity evidence needed and respond within
                the period required by applicable law.
              </p>
            </section>

            <section>
              <h2>9. Children</h2>
              <p>
                Rentle is intended for adults aged 18 and over. We do not knowingly allow
                children to create marketplace accounts. Contact us if you believe a child
                has provided personal information so we can investigate and take appropriate action.
              </p>
            </section>

            <section>
              <h2>10. Changes to this policy</h2>
              <p>
                We may update this policy as the Platform, providers or legal requirements
                change. We will post the revised policy, change its effective date and give
                reasonable notice of material changes where required.
              </p>
            </section>

            <section>
              <h2>11. Contact and complaints</h2>
              <p>
                Send privacy questions, rights requests or complaints to the contact below.
                We will acknowledge the request, investigate it and explain available
                escalation options under Nepal law. [Responsible privacy officer and
                regulator complaint route to be confirmed.]
              </p>
              <address>
                Rentle Pvt. Ltd. (registration pending)<br />
                Registered address: [to be inserted]<br />
                Privacy contact: [contact to be confirmed]
              </address>
            </section>
          </article>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
