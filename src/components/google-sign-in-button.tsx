"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import { useToast } from "./toast-provider";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

type GoogleId = {
  accounts: {
    id: {
      initialize: (config: { client_id: string; callback: (r: { credential: string }) => void }) => void;
      renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
    };
  };
};

declare global {
  interface Window {
    google?: { accounts?: GoogleId["accounts"] };
  }
}

/**
 * Google Sign-In via Google Identity Services. The browser gets an ID token
 * directly from Google and posts it to the backend (through the BFF), which
 * verifies it and returns a session — no OAuth redirect, so it fits the
 * same-origin proxy cleanly. Renders nothing until a client id is configured.
 */
export function GoogleSignInButton() {
  const holder = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { setUser } = useAuth();
  const { showToast } = useToast();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!CLIENT_ID || !holder.current) return;

    const onCredential = async (response: { credential: string }) => {
      setError("");
      try {
        const session = await authApi.google(response.credential);
        setUser(session.user);
        showToast(`Welcome, ${session.user.fullName.split(" ")[0]}.`, { tone: "success" });
        // New Google users have no phone yet — send them to finish verification.
        router.push(session.user.phoneVerified ? "/explore" : "/verification");
      } catch (caught) {
        const message = caught instanceof ApiError ? caught.message : "Google sign-in failed.";
        setError(message);
        showToast(message, { tone: "error" });
      }
    };

    const render = () => {
      const accounts = window.google?.accounts;
      if (!accounts || !holder.current) return;
      accounts.id.initialize({ client_id: CLIENT_ID, callback: onCredential });
      accounts.id.renderButton(holder.current, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width: 320,
      });
    };

    if (window.google?.accounts) {
      render();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = render;
    document.head.appendChild(script);
  }, [router, setUser, showToast]);

  if (!CLIENT_ID) return null;

  return (
    <div className="google-signin">
      <div className="google-signin__divider"><span>or</span></div>
      <div ref={holder} className="google-signin__button" />
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  );
}
