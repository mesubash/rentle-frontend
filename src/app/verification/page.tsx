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
          <h1>Verify your account</h1>
          <p>{registrationOnboarding
            ? "Confirm your contact details, then verify your identity now or return later."
            : "Confirm your email and phone, then submit your identity details."}</p>
        </header>
        <VerificationWorkspace registrationOnboarding={registrationOnboarding} />
      </div>
    </main>
  );
}
