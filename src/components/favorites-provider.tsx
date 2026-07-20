"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { favoritesApi } from "@/lib/api/favorites";
import { useAuth } from "./auth-provider";

type FavoritesContext = {
  isSaved: (id: string) => boolean;
  toggle: (id: string) => Promise<void>;
  ready: boolean;
};

const Ctx = createContext<FavoritesContext | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const load = user ? favoritesApi.ids() : Promise.resolve<string[]>([]);
    load
      .then((ids) => { if (active) setSaved(new Set(ids)); })
      .catch(() => { /* leave empty */ })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, [user]);

  const toggle = useCallback(async (id: string) => {
    if (!user) { router.push("/login"); return; }
    // Optimistic
    setSaved((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    try {
      const { saved: nowSaved } = await favoritesApi.toggle(id);
      setSaved((cur) => {
        const next = new Set(cur);
        if (nowSaved) next.add(id); else next.delete(id);
        return next;
      });
    } catch {
      // Revert on failure
      setSaved((cur) => {
        const next = new Set(cur);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
      });
    }
  }, [user, router]);

  const value = useMemo<FavoritesContext>(
    () => ({ isSaved: (id) => saved.has(id), toggle, ready }),
    [saved, toggle, ready],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFavorites() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
