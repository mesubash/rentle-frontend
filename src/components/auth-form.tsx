"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "./auth-provider";
import { BrandLogo } from "./brand-logo";
import { GoogleSignInButton } from "./google-sign-in-button";
import { useToast } from "./toast-provider";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

type AuthMode = "login" | "register";

export function AuthForm({ mode, nextPath }: { mode: AuthMode; nextPath?: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim();
    const password = String(form.get("password"));

    try {
      if (mode === "register") {
        const session = await authApi.register({
          email,
          password,
          fullName: String(form.get("fullName")).trim(),
        });
        setUser(session.user);
        showToast("Account created. Verify your phone and email to book or list.", { tone: "success" });
        router.push("/verification");
      } else {
        const session = await authApi.login({ identifier: email, password });
        setUser(session.user);
        showToast(`Welcome back, ${session.user.fullName.split(" ")[0]}.`, { tone: "success" });
        router.push(safeNext(nextPath));
      }
    } catch (caught) {
      const message = caught instanceof ApiError ? caught.message : "Something went wrong. Please try again.";
      setError(message);
      showToast(message, { tone: "error" });
    } finally {
      setLoading(false);
    }
  }

  const title = mode === "login" ? "Welcome back" : "Create your account";

  return (
    <main className="auth-page">
      <section className="auth-card card">
        <div className="auth-card__intro">
          <BrandLogo priority />
          <h1>{title}</h1>
          <p>Borrow and lend with verified people nearby.</p>
        </div>

        <form className="form-grid" onSubmit={submit}>
          {mode === "register" && (
            <div className="field">
              <label htmlFor="fullName">Full name <span className="req" aria-hidden="true">*</span></label>
              <input id="fullName" name="fullName" autoComplete="name" required />
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email address <span className="req" aria-hidden="true">*</span></label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete={mode === "login" ? "username" : "email"}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password <span className="req" aria-hidden="true">*</span></label>
            <div className="password-input">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={8}
                maxLength={72}
                required
              />
              <button
                type="button"
                className="icon-button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {mode === "register" && <small>At least 8 characters.</small>}
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button--wide" disabled={loading}>
            {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <GoogleSignInButton />
{/* 
        {mode === "register" && (
          <div className="auth-trust">
            <span>Verify your phone, email and ID from your account before booking or listing.</span>
          </div>
        )} */}

        <p className="auth-switch">
          {mode === "login"
            ? <>New to Rentle? <Link href="/register">Create an account</Link></>
            : <>Already have an account? <Link href="/login">Log in</Link></>}
        </p>
      </section>

      <aside className="auth-proof">
        <h2>Built for agreements between real neighbors.</h2>
        <ul>
          <li>Phone, email and ID verified before booking</li>
          <li>Citizenship status shown clearly</li>
          <li>Reviews only after completed bookings</li>
        </ul>
      </aside>
    </main>
  );
}

function safeNext(value?: string) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/explore";
}
