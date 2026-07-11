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
import { GoogleSignInButton } from "./google-sign-in-button";
import { useToast } from "./toast-provider";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

type AuthMode = "login" | "register" | "otp";
type LoginMethod = "phone" | "email";

export function AuthForm({
  mode,
  initialPhone = "",
  nextPath,
}: {
  mode: AuthMode;
  initialPhone?: string;
  nextPath?: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const { setUser, reload } = useAuth();
  const [phone, setPhone] = useState(() => localPhone(initialPhone));
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("phone");
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  // Registration is two-step: the phone OTP is entered on this same screen and
  // the account is only created once it verifies.
  const [awaitingCode, setAwaitingCode] = useState(mode === "otp");
  const otpInputs = useRef<Array<HTMLInputElement | null>>([]);
  const showOtp = awaitingCode || mode === "otp";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      if (mode === "register" && !awaitingCode) {
        await authApi.register({
          phoneNumber: phone,
          email: String(form.get("email")).trim(),
          password: String(form.get("password")),
          fullName: String(form.get("fullName")).trim(),
        });
        setAwaitingCode(true);
        showToast("We sent a code to your phone. Enter it to finish.", { tone: "success" });
      } else if (mode === "login") {
        const session = await authApi.login({
          identifier: loginMethod === "phone" ? phone : String(form.get("identifier")).trim(),
          password: String(form.get("password")),
        });
        setUser(session.user);
        showToast(`Welcome back, ${session.user.fullName.split(" ")[0]}.`, { tone: "success" });
        router.push(safeNext(nextPath));
      } else {
        // Registration step 2 — verify OTP, create the account, start the session.
        const session = await authApi.completeRegistration(phone, digits.join(""));
        setUser(session.user);
        await reload();
        showToast("Phone verified. Finish verifying to book or list.", { tone: "success" });
        router.push("/verification");
      }
    } catch (caught) {
      const message = apiMessage(caught);
      setError(message);
      showToast(message, { tone: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    setError("");
    try {
      await authApi.resendRegistration(phone);
      setResent(true);
      showToast("A new verification code was sent.", { tone: "success" });
      window.setTimeout(() => setResent(false), 5000);
    } catch (caught) {
      const message = apiMessage(caught);
      setError(message);
      showToast(message, { tone: "error" });
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

  const title = showOtp
    ? "Verify your phone"
    : mode === "login"
      ? "Welcome back"
      : "Join your neighborhood";

  return (
    <main className="auth-page">
      <section className="auth-card card">
        <div className="auth-card__intro">
          <Link className="brand" href="/">Rentle</Link>
          <p className="eyebrow">Trust starts with a real person</p>
          <h1>{title}</h1>
          <p>
            {showOtp
              ? `We sent a six-digit code to +977 ${phone}.`
              : "Borrow and lend with verified people nearby."}
          </p>
        </div>

        <form className="form-grid" onSubmit={submit}>
          {mode === "register" && !showOtp && (
            <div className="field">
              <label htmlFor="fullName">Full name</label>
              <input id="fullName" name="fullName" autoComplete="name" required />
            </div>
          )}

          {mode === "login" ? (
            <><div className="auth-method-switch" aria-label="Login method"><button type="button" className={loginMethod === "phone" ? "is-active" : ""} aria-pressed={loginMethod === "phone"} onClick={() => { setLoginMethod("phone"); setError(""); }}>Phone</button><button type="button" className={loginMethod === "email" ? "is-active" : ""} aria-pressed={loginMethod === "email"} onClick={() => { setLoginMethod("email"); setError(""); }}>Email</button></div>{loginMethod === "phone" ? <PhoneField value={phone} onChange={setPhone} id="login-phone" /> : <div className="field"><label htmlFor="identifier">Email address</label><input id="identifier" name="identifier" type="email" autoComplete="username" required /></div>}</>
          ) : !showOtp ? (
            <PhoneField value={phone} onChange={setPhone} id="register-phone" />
          ) : null}

          {mode === "register" && !showOtp && (
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" autoComplete="email" required />
            </div>
          )}

          {!showOtp && (
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

          {showOtp && (
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
              : showOtp
                ? "Verify and continue"
                : mode === "login"
                  ? "Log in"
                  : "Create account"}
          </button>
        </form>

        {!showOtp && <GoogleSignInButton />}

        <div className="auth-trust">
          <ShieldCheck size={18} />
          <span>Your phone number is private and used for verification and booking updates.</span>
        </div>
        {!showOtp && (
          <p className="auth-switch">
            {mode === "login"
              ? <>New to Rentle? <Link href="/register">Create an account</Link></>
              : <>Already have an account? <Link href="/login">Log in</Link></>}
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

function PhoneField({ value, onChange, id }: { value: string; onChange: (value: string) => void; id: string }) {
  return <div className="field"><label htmlFor={id}>Phone number</label><div className="phone-input"><span aria-hidden="true">+977</span><input id={id} name="phone" type="tel" autoComplete="tel-national" inputMode="numeric" pattern="[0-9]{10}" minLength={10} maxLength={10} value={value} onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="9812345678" aria-describedby={`${id}-hint`} required /></div><small id={`${id}-hint`}>Enter the 10 digits after +977, without spaces.</small></div>;
}

function localPhone(value: string) {
  return value.replace(/\D/g, "").replace(/^977/, "").slice(0, 10);
}

function safeNext(value?: string) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/explore";
}

function apiMessage(error: unknown) {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
}
