"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { useAuth } from "./auth-provider";
import { ContactVerification } from "./contact-verification";
import { KycForm } from "./kyc-form";
import { kycApi, type Kyc } from "@/lib/api/kyc";

export function VerificationWorkspace() {
  const { user } = useAuth();
  const [kyc, setKyc] = useState<Kyc | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    kycApi
      .mine()
      .then(setKyc)
      .catch(() => setKyc(null))
      .finally(() => setLoaded(true));
  }, []);

  const contactReady = Boolean(user?.phoneVerified && user?.emailVerified);

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
      {loaded && <KycForm initial={kyc} contactReady={contactReady} />}
    </>
  );
}
