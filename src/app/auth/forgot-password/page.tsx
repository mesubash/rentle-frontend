"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authApi.forgotPassword(email.trim());
      setSent(true);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "We could not start the password reset. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card card">
        {sent ? (
          <div className="verification-success">
            <CheckCircle2 size={34} />
            <p className="eyebrow">Check your email</p>
            <h1>We sent password reset instructions.</h1>
            <p>If an account exists for {email.trim()}, use the link in that email to choose a new password.</p>
            <Link className="button button--wide" href="/login">Back to login</Link>
          </div>
        ) : (
          <>
            <div className="auth-card__intro">
              <BrandLogo priority />
              <h1>Reset your password</h1>
              <p>Enter your account email and we’ll send you a reset link.</p>
            </div>
            <form className="form-grid" onSubmit={submit}>
              <div className="field">
                <label htmlFor="forgot-email">Email address <span className="req" aria-hidden="true">*</span></label>
                <input id="forgot-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="button button--wide" disabled={loading}>{loading ? "Sending…" : "Send reset link"}</button>
            </form>
            <p className="auth-switch">Remembered it? <Link href="/login">Log in</Link></p>
          </>
        )}
      </section>
    </main>
  );
}
