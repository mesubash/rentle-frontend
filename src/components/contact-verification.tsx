"use client";

import { useState } from "react";
import { CheckCircle2, Mail, Phone, ShieldAlert } from "lucide-react";
import { useAuth } from "./auth-provider";
import { useToast } from "./toast-provider";
import { usersApi, type UserProfile } from "@/lib/api/users";
import { ApiError } from "@/lib/api/client";
import { NepalPhoneInput } from "./nepal-phone-input";
import { toNepalInternationalPhone, toNepalLocalPhone } from "@/lib/phone";

function message(caught: unknown, fallback: string) {
  return caught instanceof ApiError ? caught.message : fallback;
}

/**
 * Two-step contact verification shown before identity (KYC) review. Google
 * accounts arrive with a verified email, so typically only the phone step
 * remains; manual signups verify both.
 */
export function ContactVerification() {
  const { user, setUser } = useAuth();
  if (!user) return null;

  return (
    <div className="contact-verification">
      {!user.phoneVerified && (
        <div className="form-note form-note--warn">
          <ShieldAlert size={18} />
          <span>Add and verify your phone number to book or list on Rentle.</span>
        </div>
      )}
      <EmailStep verified={user.emailVerified} email={user.email} />
      <PhoneStep
        verified={user.phoneVerified}
        phone={user.phoneNumber}
        onVerified={setUser}
      />
    </div>
  );
}

function EmailStep({ verified, email }: { verified: boolean; email: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  if (verified) return <VerifiedRow icon={<Mail size={18} />} label="Email verified" />;

  // Verification happens by opening the emailed link; this just (re)sends it.
  async function resend() {
    setBusy(true); setError("");
    try {
      await usersApi.sendEmailVerification();
      showToast("Verification link sent — check your email.", { tone: "success" });
    } catch (caught) {
      const detail = message(caught, "Could not send the link.");
      setError(detail); showToast(detail, { tone: "error" });
    } finally { setBusy(false); }
  }

  return (
    <section className="verify-step card">
      <div className="verify-step__head"><Mail size={18} /><strong>Verify your email</strong></div>
      <p className="verify-step__hint">We sent a verification link to <strong>{email}</strong>. Open it to confirm your address — you can keep using Rentle in the meantime.</p>
      <button className="button button--secondary" disabled={busy} onClick={resend}>
        {busy ? "Sending…" : "Resend verification link"}
      </button>
      {error && <p className="form-error" role="alert">{error}</p>}
    </section>
  );
}

function PhoneStep({
  verified,
  phone,
  onVerified,
}: {
  verified: boolean;
  phone: string | null;
  onVerified: (u: UserProfile) => void;
}) {
  const [number, setNumber] = useState(toNepalLocalPhone(phone));
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  if (verified) return <VerifiedRow icon={<Phone size={18} />} label={`Phone verified · ${phone ?? ""}`} />;

  async function send() {
    setBusy(true); setError("");
    try { await usersApi.setPhone(toNepalInternationalPhone(number)); setSent(true); showToast("A verification code was sent by SMS.", { tone: "success" }); }
    catch (caught) { const detail = message(caught, "Could not send the code."); setError(detail); showToast(detail, { tone: "error" }); }
    finally { setBusy(false); }
  }
  async function verify() {
    setBusy(true); setError("");
    try { onVerified(await usersApi.verifyPhone(code)); showToast("Phone number verified.", { tone: "success" }); }
    catch (caught) { const detail = message(caught, "That code did not match."); setError(detail); showToast(detail, { tone: "error" }); }
    finally { setBusy(false); }
  }

  return (
    <section className="verify-step card">
      <div className="verify-step__head"><Phone size={18} /><strong>Verify your phone</strong></div>
      <div className="field">
        <label htmlFor="verify-phone">Phone number</label>
        <NepalPhoneInput id="verify-phone" autoComplete="tel-national" value={number}
          onChange={(e) => setNumber(e.target.value)} disabled={sent} required pattern="[0-9]{10}" placeholder="98XXXXXXXX" />
        <small>Enter the 10-digit Nepal number. The +977 country code is added automatically.</small>
      </div>
      {!sent ? (
        <button className="button button--secondary" disabled={busy || number.length !== 10} onClick={send}>
          {busy ? "Sending…" : "Send code by SMS"}
        </button>
      ) : (
        <div className="verify-step__row">
          <label className="sr-only" htmlFor="phone-code">Phone code</label>
          <input id="phone-code" inputMode="numeric" maxLength={6} placeholder="6-digit code"
            value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
          <button className="button" disabled={busy || code.length !== 6} onClick={verify}>Verify</button>
          <button className="text-button" type="button" disabled={busy}
            onClick={() => { setSent(false); setCode(""); }}>Change number</button>
        </div>
      )}
      {error && <p className="form-error" role="alert">{error}</p>}
    </section>
  );
}

function VerifiedRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <section className="verify-step card is-done">
      <div className="verify-step__head">{icon}<strong>{label}</strong><CheckCircle2 size={18} className="verify-step__check" /></div>
    </section>
  );
}
