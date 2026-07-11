"use client";

import Link from "next/link";
import { FormEvent, KeyboardEvent, useRef, useState } from "react";
import { CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";

export function AuthForm({ mode }: { mode: "login" | "register" | "otp" }) {
  const [phone, setPhone] = useState("+977 ");
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); window.setTimeout(() => { window.location.href = mode === "register" ? "/auth/verify" : "/explore"; }, 650);
  }
  function otpInput(index: number, value: string) { if (value && index < 5) inputs.current[index + 1]?.focus(); }
  function otpKey(index: number, event: KeyboardEvent<HTMLInputElement>) { if (event.key === "Backspace" && !event.currentTarget.value && index > 0) inputs.current[index - 1]?.focus(); }

  const title = mode === "login" ? "Welcome back" : mode === "register" ? "Join your neighborhood" : "Verify your phone";
  return (
    <main className="auth-page"><section className="auth-card card">
      <div className="auth-card__intro"><Link className="brand" href="/">Rentle</Link><p className="eyebrow">Trust starts with a real person</p><h1>{title}</h1><p>{mode === "otp" ? "We sent a six-digit code to +977 98•• ••••12." : "Borrow and lend with verified people nearby."}</p></div>
      <form className="form-grid" onSubmit={submit}>
        {mode === "register" && <div className="field"><label htmlFor="name">Full name</label><input id="name" autoComplete="name" required placeholder="Aayush Shrestha" /></div>}
        {mode !== "otp" && <div className="field"><label htmlFor="phone">Phone number</label><input id="phone" autoComplete="tel" inputMode="tel" required value={phone} onChange={(event) => setPhone(event.target.value.replace(/[^+\d ]/g, ""))} /><small>We use this for OTP verification and booking updates.</small></div>}
        {mode === "register" && <div className="field"><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" required placeholder="aayush@example.com" /></div>}
        {mode !== "otp" && <div className="field"><label htmlFor="password">Password</label><input id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required /><small>At least 8 characters.</small></div>}
        {mode === "otp" && <><div className="otp" aria-label="Six digit verification code">{Array.from({ length: 6 }).map((_, index) => <input key={index} ref={(node) => { inputs.current[index] = node; }} aria-label={`Digit ${index + 1}`} inputMode="numeric" autoComplete={index === 0 ? "one-time-code" : "off"} maxLength={1} onInput={(event) => otpInput(index, event.currentTarget.value)} onKeyDown={(event) => otpKey(index, event)} required />)}</div><button type="button" className="text-button" disabled={resent} onClick={() => { setResent(true); window.setTimeout(() => setResent(false), 5000); }}>{resent ? "A new code was sent" : "Send a new code"}</button></>}
        <button className="button button--wide" disabled={loading}>{loading ? "Checking…" : mode === "login" ? "Log in" : mode === "register" ? "Create account" : "Verify and continue"}</button>
      </form>
      <div className="auth-trust"><ShieldCheck size={18} /><span>Your phone number is never shown publicly. It helps us keep duplicate and fake accounts out.</span></div>
      {mode !== "otp" && <p className="auth-switch">{mode === "login" ? <>New to Rentle? <Link href="/auth/register">Create an account</Link></> : <>Already have an account? <Link href="/auth/login">Log in</Link></>}</p>}
    </section><aside className="auth-proof"><LockKeyhole size={26} /><h2>Built for agreements between real neighbors.</h2><ul><li><CheckCircle2 /> Phone verified before booking</li><li><CheckCircle2 /> Citizenship status shown clearly</li><li><CheckCircle2 /> Reviews only after completed bookings</li></ul></aside></main>
  );
}
