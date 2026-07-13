"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { PermissionKey } from "@/lib/iam/permission-keys";
import { usePermissions } from "./permissions-provider";

export function useCan(key: PermissionKey) {
  const { can, ready } = usePermissions();
  return ready && can(key);
}

export function Can({
  perm,
  any,
  children,
  fallback = null,
}: {
  perm?: PermissionKey;
  any?: readonly PermissionKey[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { can, canAny, ready } = usePermissions();
  const allowed = ready && (perm ? can(perm) : any ? canAny(...any) : false);
  return <>{allowed ? children : fallback}</>;
}

export function PermissionGuardedPage({
  perm,
  any,
  children,
}: {
  perm?: PermissionKey;
  any?: readonly PermissionKey[];
  children: ReactNode;
}) {
  const { can, canAny, ready } = usePermissions();

  if (!ready) {
    return (
      <div className="admin-access-skeleton" aria-label="Checking access">
        <span />
        <span />
        <span />
      </div>
    );
  }

  const allowed = perm ? can(perm) : any ? canAny(...any) : false;
  if (!allowed) {
    return (
      <section className="admin-no-access card">
        <p className="eyebrow">Access limited</p>
        <h1>You don&apos;t have access to this section</h1>
        <p>Your current staff permissions do not include this workspace.</p>
        <Link className="button" href="/">
          Return home
        </Link>
      </section>
    );
  }

  return <>{children}</>;
}
