"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { setForbiddenHandler } from "@/lib/api/client";
import { platformApi } from "@/lib/api/platform";
import type { PermissionKey } from "@/lib/iam/permission-keys";
import { useAuth } from "./auth-provider";
import { useToast } from "./toast-provider";

type PermissionContextValue = {
  permissions: Set<string>;
  can: (key: PermissionKey) => boolean;
  canAny: (...keys: PermissionKey[]) => boolean;
  ready: boolean;
  refetch: () => Promise<void>;
};

type PermissionSnapshot = {
  userId: string | null;
  permissions: Set<string>;
};

const PermissionContext = createContext<PermissionContextValue | null>(null);
const EMPTY_PERMISSIONS = new Set<string>();

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [snapshot, setSnapshot] = useState<PermissionSnapshot>({
    userId: null,
    permissions: new Set(),
  });
  const lastForbiddenAt = useRef(0);

  useEffect(() => {
    let active = true;
    const userId = user?.id ?? null;

    if (!userId) {
      Promise.resolve().then(() => {
        if (active) setSnapshot({ userId: null, permissions: new Set() });
      });
      return () => {
        active = false;
      };
    }

    platformApi
      .myPermissions()
      .then((keys) => {
        if (active) setSnapshot({ userId, permissions: new Set(keys) });
      })
      .catch(() => {
        if (active) setSnapshot({ userId, permissions: new Set() });
      });

    return () => {
      active = false;
    };
  }, [user]);

  const refetch = useCallback(async () => {
    const userId = user?.id;
    if (!userId) {
      setSnapshot({ userId: null, permissions: new Set() });
      return;
    }

    setSnapshot((current) => ({ ...current, userId: null }));
    try {
      const keys = await platformApi.myPermissions();
      setSnapshot({ userId, permissions: new Set(keys) });
    } catch {
      setSnapshot({ userId, permissions: new Set() });
    }
  }, [user?.id]);

  const permissions = user ? snapshot.permissions : EMPTY_PERMISSIONS;
  const ready = !user || snapshot.userId === user.id;

  useEffect(() => {
    setForbiddenHandler((error) => {
      const now = Date.now();
      if (now - lastForbiddenAt.current > 1500) {
        lastForbiddenAt.current = now;
        showToast(error.message, { tone: "error" });
        void refetch();
      }
    });
    return () => setForbiddenHandler(null);
  }, [refetch, showToast]);

  const value = useMemo<PermissionContextValue>(() => {
    const can = (key: PermissionKey) => permissions.has(key);
    return {
      permissions,
      can,
      canAny: (...keys) => keys.some(can),
      ready,
      refetch,
    };
  }, [permissions, ready, refetch]);

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const value = useContext(PermissionContext);
  if (!value) {
    throw new Error("usePermissions must be used inside PermissionsProvider");
  }
  return value;
}
