"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";

function VerifyEmailResult() {
  const status = useSearchParams().get("status");
  const ok = status === "success";

  return (
    <main className="auth-page">
      <section className="auth-card card">
        <div className="verification-success">
          {ok ? <CheckCircle2 size={34} /> : <XCircle size={34} />}
          <p className="eyebrow">Email verification</p>
          <h1>{ok ? "Your email is verified." : "This link didn't work."}</h1>
          <p>
            {ok
              ? "Thanks for confirming your email address. You can carry on where you left off."
              : "The link may have expired or already been used. Sign in and send yourself a new one from the verification page."}
          </p>
          <Link className="button button--wide" href={ok ? "/explore" : "/verification"}>
            {ok ? "Continue" : "Go to verification"}
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<main className="auth-page"><section className="auth-card card"><p>Loading…</p></section></main>}>
      <VerifyEmailResult />
    </Suspense>
  );
}
