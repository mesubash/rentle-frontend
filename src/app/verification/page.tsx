import type { Metadata } from "next";
import { VerificationWorkspace } from "@/components/verification-workspace";

export const metadata: Metadata = { title: "Get verified" };

export default function VerificationPage() {
  return (
    <main className="page">
      <div className="container verification-page">
        <header className="page-header">
          <p className="eyebrow">Get verified</p>
          <h1>Verify your account</h1>
          <p>Confirm your email and phone, then submit your identity details. All three are needed before you can book or list.</p>
        </header>
        <VerificationWorkspace />
      </div>
    </main>
  );
}
