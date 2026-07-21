"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi } from "@/lib/api/auth";
import { usersApi, type UserProfile } from "@/lib/api/users";

type AuthContextValue = {
  user: UserProfile | null;
  loading: boolean;
  setUser: (user: UserProfile | null) => void;
  reload: () => Promise<UserProfile | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Non-httpOnly hint mirrored by middleware.ts. Reading it here rather than calling
 * cookies() in the root layout is what lets routes prerender; it decides only whether we
 * bother probing /users/me, never what the user is allowed to do.
 */
function hasSessionHint() {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((entry) => entry === "rentle_has_session=1");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  // Starts true and is cleared by the effect below when there is no session, so the server
  // and client agree on the first render (no hydration mismatch on a prerendered page).
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const profile = await usersApi.me();
      setUser(profile);
      return profile;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    // No session hint means no request at all — same as before, just sourced from the
    // mirrored cookie rather than a server-side cookies() read.
    const probe = hasSessionHint() ? usersApi.me() : Promise.resolve(null);

    probe
      .then((profile) => {
        if (active) setUser(profile);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, setUser, reload, logout }),
    [loading, logout, reload, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
