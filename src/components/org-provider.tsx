"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { organizationsApi, type OrgSummary } from "@/lib/api/organizations";
import { useAuth } from "./auth-provider";

const STORAGE_KEY = "rentle.activeOrgId";

type OrgContext = {
  orgs: OrgSummary[];
  /** Active provider context: null = acting as yourself, otherwise the org id. */
  activeOrgId: string | null;
  activeOrg: OrgSummary | null;
  setActiveOrgId: (id: string | null) => void;
  reload: () => void;
  ready: boolean;
};

const Ctx = createContext<OrgContext | null>(null);

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [orgs, setOrgs] = useState<OrgSummary[]>([]);
  const [activeOrgId, setActive] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    const load = user ? organizationsApi.mine() : Promise.resolve<OrgSummary[]>([]);
    load
      .then((mine) => {
        if (!active) return;
        setOrgs(mine);
        const stored = window.localStorage.getItem(STORAGE_KEY);
        // Drop a stale selection if the user is no longer a member of that org.
        setActive(stored && mine.some((o) => o.id === stored) ? stored : null);
      })
      .catch(() => { if (active) setOrgs([]); })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, [user, refreshKey]);

  const reload = useCallback(() => setRefreshKey((k) => k + 1), []);

  const setActiveOrgId = useCallback((id: string | null) => {
    setActive(id);
    if (id) window.localStorage.setItem(STORAGE_KEY, id);
    else window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo<OrgContext>(() => ({
    orgs,
    activeOrgId,
    activeOrg: orgs.find((o) => o.id === activeOrgId) ?? null,
    setActiveOrgId,
    reload,
    ready,
  }), [orgs, activeOrgId, setActiveOrgId, reload, ready]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOrg() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useOrg must be used within OrgProvider");
  return ctx;
}
