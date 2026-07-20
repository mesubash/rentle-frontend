"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import { useAuth } from "./auth-provider";
import { ContactVerification } from "./contact-verification";
import { KycForm } from "./kyc-form";
import { kycApi, type Kyc } from "@/lib/api/kyc";

export function VerificationWorkspace({ registrationOnboarding = false }: { registrationOnboarding?: boolean }) {
  const { user } = useAuth();
  const router = useRouter();
  const [kyc, setKyc] = useState<Kyc | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [showKycForm, setShowKycForm] = useState(!registrationOnboarding);

  useEffect(() => {
    kycApi
      .mine()
      .then(setKyc)
      .catch(() => setKyc(null))
      .finally(() => setLoaded(true));
  }, []);

  const contactReady = Boolean(user?.phoneVerified && user?.emailVerified);
  const deferKyc = () => router.push("/explore");

  // Already fully verified — don't show the onboarding steps again.
  if (user?.status === "VERIFIED") {
    return (
      <div className="card card-pad verification-done">
        <BadgeCheck size={28} />
        <div>
          <h2>You&apos;re verified</h2>
          <p>Your identity is confirmed. You can book and list across Rentle. Manage your details from your <Link href="/profile/edit">profile</Link>.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ContactVerification />
      {loaded && registrationOnboarding && !kyc && !showKycForm ? (
        <section className="verify-step card kyc-choice">
          <div className="verify-step__head"><ShieldCheck size={18} /><strong>Identity verification is optional for now</strong></div>
          <p className="verify-step__hint">Verify now to start the review sooner, or continue exploring and return from your profile when you are ready. You will need approval before booking or listing.</p>
          <div className="button-row">
            <button type="button" className="button" onClick={() => setShowKycForm(true)}>Verify identity now</button>
            <button type="button" className="button button--secondary" onClick={deferKyc}>I&apos;ll verify later</button>
          </div>
        </section>
      ) : loaded ? (
        <KycForm initial={kyc} contactReady={contactReady} onDefer={registrationOnboarding && !kyc ? deferKyc : undefined} />
      ) : null}
    </>
  );
}
