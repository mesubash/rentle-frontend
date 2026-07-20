import type { Metadata } from "next";
import { VerificationWorkspace } from "@/components/verification-workspace";

export const metadata: Metadata = { title: "Get verified" };

export default async function VerificationPage({ searchParams }: { searchParams: Promise<{ onboarding?: string }> }) {
  const { onboarding } = await searchParams;
  const registrationOnboarding = onboarding === "registration";

  return (
    <main className="page">
      <div className="container verification-page">
        <header className="page-header">
          <p className="eyebrow">Get verified</p>
          <h1>Verify your account</h1>
          <p>{registrationOnboarding
            ? "Confirm your contact details, then choose whether to verify your identity now or later. Identity verification is still required before you can book or list."
            : "Confirm your email and phone, then submit your identity details. All three are needed before you can book or list."}</p>
        </header>
        <VerificationWorkspace registrationOnboarding={registrationOnboarding} />
      </div>
    </main>
  );
}
