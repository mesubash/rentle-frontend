"use client";

import { useEffect, useState } from "react";
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

  return (
    <>
      <ContactVerification />
      {loaded && <KycForm initial={kyc} contactReady={contactReady} />}
    </>
  );
}
