"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { authApi } from "@/lib/api/auth";

function GoogleCallback() {
  const code = useSearchParams().get("code");
  const router = useRouter();
  const { setUser } = useAuth();
  const [error, setError] = useState(code ? "" : "This sign-in link is missing its code.");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || !code) return;
    ran.current = true;
    authApi
      .googleExchange(code)
      .then((session) => {
        setUser(session.user);
        // New Google users have no phone yet — send them to finish verification.
        router.replace(session.user.phoneVerified ? "/explore" : "/verification");
      })
      .catch(() => setError("We couldn't complete your Google sign-in. Please try again."));
  }, [code, router, setUser]);

  return (
    <main className="auth-page">
      <section className="auth-card card">
        <div className="auth-card__intro">
          <p className="eyebrow">Google sign-in</p>
          <h1>{error ? "Sign-in failed" : "Signing you in…"}</h1>
          <p>{error || "One moment while we finish connecting your Google account."}</p>
        </div>
        {error && <Link className="button button--wide" href="/auth/login">Back to log in</Link>}
      </section>
    </main>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<main className="auth-page"><section className="auth-card card"><p>Loading…</p></section></main>}>
      <GoogleCallback />
    </Suspense>
  );
}
