"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { ADMIN_ENTRY_KEYS } from "@/lib/iam/admin-entry-keys";
import { P, type PermissionKey } from "@/lib/iam/permission-keys";
import { useAuth } from "@/components/auth-provider";
import { PermissionGuardedPage } from "@/components/can";
import { usePermissions } from "@/components/permissions-provider";

type Stats = {
  pendingKyc: number;
  users: number;
  listings: number;
  bookings: number;
};

const cards: Array<{
  key: keyof Stats;
  label: string;
  href: string;
  cta: string;
  permission: PermissionKey;
}> = [
  { key: "pendingKyc", label: "Pending verifications", href: "/admin/verifications", cta: "Review queue", permission: P.KYC_SUBMISSION_READ },
  { key: "users", label: "Registered users", href: "/admin/users", cta: "Manage users", permission: P.IDENTITY_USER_READ },
  { key: "listings", label: "Marketplace listings", href: "/admin/listings", cta: "View listings", permission: P.LISTING_LISTING_READ },
  { key: "bookings", label: "Bookings", href: "/admin/bookings", cta: "View bookings", permission: P.BOOKING_BOOKING_READ },
];

export default function AdminDashboardPage() {
  return (
    <PermissionGuardedPage any={ADMIN_ENTRY_KEYS}>
      <AdminDashboard />
    </PermissionGuardedPage>
  );
}

function AdminDashboard() {
  const { user } = useAuth();
  const { can } = usePermissions();
  const [stats, setStats] = useState<Partial<Stats>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      const jobs: Promise<void>[] = [];
      const add = (key: keyof Stats, request: Promise<{ totalElements: number }>) => {
        jobs.push(request.then((page) => {
          if (active) setStats((current) => ({ ...current, [key]: page.totalElements }));
        }));
      };

      if (can(P.KYC_SUBMISSION_READ)) add("pendingKyc", adminApi.kycQueue(0, 1));
      if (can(P.IDENTITY_USER_READ)) add("users", adminApi.users(undefined, 0, 1));
      if (can(P.LISTING_LISTING_READ)) add("listings", adminApi.listings(0, 1));
      if (can(P.BOOKING_BOOKING_READ)) add("bookings", adminApi.bookings(0, 1));

      const results = await Promise.allSettled(jobs);
      if (active && results.some((result) => result.status === "rejected")) {
        setError("Some dashboard numbers could not be loaded right now.");
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [can]);

  const visibleCards = cards.filter((card) => can(card.permission));

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Staff workspace</p>
          <h1>{user ? `Namaste, ${user.fullName.split(" ")[0]}.` : "Dashboard"}</h1>
          <p>Your dashboard reflects the areas your current permissions allow you to manage.</p>
        </div>
      </header>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="admin-stats">
        {visibleCards.map(({ key, label, href, cta }) => (
          <article key={key} className={key === "pendingKyc" && stats.pendingKyc ? "admin-stat card admin-stat--attention" : "admin-stat card"}>
            <small>{label}</small>
            <strong>{stats[key] ?? "–"}</strong>
            <Link href={href}>{cta} <ArrowRight size={14} /></Link>
          </article>
        ))}
      </div>
    </div>
  );
}
