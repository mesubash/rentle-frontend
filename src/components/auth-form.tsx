"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  type KeyboardEvent,
  useRef,
  useState,
} from "react";
import { CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";
import { useAuth } from "./auth-provider";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

type AuthMode = "login" | "register" | "otp";

export function AuthForm({
  mode,
  initialPhone = "",
}: {
  mode: AuthMode;
  initialPhone?: string;
}) {
  const router = useRouter();
  const { setUser, reload } = useAuth();
  const [phone, setPhone] = useState(initialPhone || "+977");
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const otpInputs = useRef<Array<HTMLInputElement | null>>([]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      if (mode === "register") {
        const session = await authApi.register({
          phoneNumber: normalizePhone(phone),
          email: String(form.get("email")),
          password: String(form.get("password")),
          fullName: String(form.get("fullName")),
        });
        setUser(session.user);
        router.push(`/auth/verify?phone=${encodeURIComponent(normalizePhone(phone))}`);
      } else if (mode === "login") {
        const session = await authApi.login({
          identifier: String(form.get("identifier")),
          password: String(form.get("password")),
        });
        setUser(session.user);
        router.push("/explore");
      } else {
        await authApi.verifyOtp(normalizePhone(phone), digits.join(""));
        await reload();
        router.push("/explore");
      }
    } catch (caught) {
      setError(apiMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    setError("");
    try {
      await authApi.sendOtp(normalizePhone(phone));
      setResent(true);
      window.setTimeout(() => setResent(false), 5000);
    } catch (caught) {
      setError(apiMessage(caught));
    }
  }

  function updateDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setDigits((current) => current.map((item, itemIndex) => itemIndex === index ? digit : item));
    if (digit && index < 5) otpInputs.current[index + 1]?.focus();
  }

  function otpKey(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  }

  const title = mode === "login"
    ? "Welcome back"
    : mode === "register"
      ? "Join your neighborhood"
      : "Verify your phone";

  return (
    <main className="auth-page">
      <section className="auth-card card">
        <div className="auth-card__intro">
          <Link className="brand" href="/">Rentle</Link>
          <p className="eyebrow">Trust starts with a real person</p>
          <h1>{title}</h1>
          <p>
            {mode === "otp"
              ? `We sent a six-digit code to ${phone}.`
              : "Borrow and lend with verified people nearby."}
          </p>
        </div>

        <form className="form-grid" onSubmit={submit}>
          {mode === "register" && (
            <div className="field">
              <label htmlFor="fullName">Full name</label>
              <input id="fullName" name="fullName" autoComplete="name" required />
            </div>
          )}

          {mode === "login" ? (
            <div className="field">
              <label htmlFor="identifier">Phone number or email</label>
              <input id="identifier" name="identifier" autoComplete="username" required />
            </div>
          ) : mode !== "otp" ? (
            <div className="field">
              <label htmlFor="phone">Phone number</label>
              <input
                id="phone"
                name="phone"
                autoComplete="tel"
                inputMode="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value.replace(/[^+\d ]/g, ""))}
                required
              />
              <small>Use international format, for example +9779812345678.</small>
            </div>
          ) : null}

          {mode === "register" && (
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" autoComplete="email" required />
            </div>
          )}

          {mode !== "otp" && (
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={8}
                maxLength={72}
                required
              />
              {mode === "register" && <small>Use 8–72 characters.</small>}
            </div>
          )}

          {mode === "otp" && (
            <>
              <div className="otp" aria-label="Six digit verification code">
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(node) => { otpInputs.current[index] = node; }}
                    aria-label={`Digit ${index + 1}`}
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    value={digit}
                    onChange={(event) => updateDigit(index, event.target.value)}
                    onKeyDown={(event) => otpKey(index, event)}
                    required
                  />
                ))}
              </div>
              <button
                type="button"
                className="text-button"
                disabled={resent}
                onClick={resendOtp}
              >
                {resent ? "A new code was sent" : "Send a new code"}
              </button>
            </>
          )}

          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button--wide" disabled={loading}>
            {loading
              ? "Please wait…"
              : mode === "login"
                ? "Log in"
                : mode === "register"
                  ? "Create account"
                  : "Verify and continue"}
          </button>
        </form>

        <div className="auth-trust">
          <ShieldCheck size={18} />
          <span>Your phone number is private and used for verification and booking updates.</span>
        </div>
        {mode !== "otp" && (
          <p className="auth-switch">
            {mode === "login"
              ? <>New to Rentle? <Link href="/auth/register">Create an account</Link></>
              : <>Already have an account? <Link href="/auth/login">Log in</Link></>}
          </p>
        )}
      </section>

      <aside className="auth-proof">
        <LockKeyhole size={26} />
        <h2>Built for agreements between real neighbors.</h2>
        <ul>
          <li><CheckCircle2 /> Phone verified before booking</li>
          <li><CheckCircle2 /> Citizenship status shown clearly</li>
          <li><CheckCircle2 /> Reviews only after completed bookings</li>
        </ul>
      </aside>
    </main>
  );
}

function normalizePhone(value: string) {
  return value.replace(/\s+/g, "");
}

function apiMessage(error: unknown) {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
}
