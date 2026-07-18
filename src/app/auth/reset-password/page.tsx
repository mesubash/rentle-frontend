"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, type FormEvent, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

function ResetPasswordForm() {
  const token = useSearchParams().get("token")?.trim() ?? "";
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [reset, setReset] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      await authApi.resetPassword(token, password);
      setReset(true);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Your password could not be reset. Please request a new link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card card">
        {reset ? (
          <div className="verification-success">
            <CheckCircle2 size={34} />
            <p className="eyebrow">Password updated</p>
            <h1>Your new password is ready.</h1>
            <p>Log in with your email address and the password you just chose.</p>
            <Link className="button button--wide" href="/login">Log in</Link>
          </div>
        ) : (
          <>
            <div className="auth-card__intro">
              <BrandLogo priority />
              <h1>Choose a new password</h1>
              <p>Use at least 8 characters that you don’t reuse elsewhere.</p>
            </div>
            {!token ? (
              <div className="form-grid">
                <p className="form-error" role="alert">This reset link is missing its token. Request a new link to continue.</p>
                <Link className="button button--wide" href="/auth/forgot-password">Request another link</Link>
              </div>
            ) : (
              <form className="form-grid" onSubmit={submit}>
                <div className="field">
                  <label htmlFor="reset-password">New password <span className="req" aria-hidden="true">*</span></label>
                  <input id="reset-password" type="password" autoComplete="new-password" minLength={8} maxLength={72} value={password} onChange={(event) => setPassword(event.target.value)} required />
                  <small>At least 8 characters.</small>
                </div>
                {error && <p className="form-error" role="alert">{error}</p>}
                <button className="button button--wide" disabled={loading}>{loading ? "Updating…" : "Reset password"}</button>
              </form>
            )}
            <p className="auth-switch"><Link href="/login">Back to login</Link></p>
          </>
        )}
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="auth-page"><section className="auth-card card"><p>Loading…</p></section></main>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
