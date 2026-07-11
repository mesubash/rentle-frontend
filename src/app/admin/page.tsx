"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { useAuth } from "@/components/auth-provider";

type Stats = { pendingKyc: number; users: number; listings: number; bookings: number };

const cards: Array<{ key: keyof Stats; label: string; href: string; cta: string }> = [
  { key: "pendingKyc", label: "Pending verifications", href: "/admin/verifications", cta: "Review queue" },
  { key: "users", label: "Registered users", href: "/admin/users", cta: "Manage users" },
  { key: "listings", label: "Live listings", href: "/admin/listings", cta: "View listings" },
  { key: "bookings", label: "Bookings", href: "/admin/bookings", cta: "View bookings" },
];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      adminApi.kycQueue(0, 1),
      adminApi.users(undefined, 0, 1),
      adminApi.listings(0, 1),
      adminApi.bookings(0, 1),
    ])
      .then(([kyc, users, listings, bookings]) => setStats({
        pendingKyc: kyc.totalElements,
        users: users.totalElements,
        listings: listings.totalElements,
        bookings: bookings.totalElements,
      }))
      .catch(() => setError("Dashboard numbers could not be loaded right now."));
  }, []);

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Admin workspace</p>
          <h1>{user ? `Namaste, ${user.fullName.split(" ")[0]}.` : "Dashboard"}</h1>
          <p>Verifications are the queue that keeps the marketplace trustworthy — start there.</p>
        </div>
      </header>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="admin-stats">
        {cards.map(({ key, label, href, cta }) => (
          <article key={key} className={key === "pendingKyc" && stats?.pendingKyc ? "admin-stat card admin-stat--attention" : "admin-stat card"}>
            <small>{label}</small>
            <strong>{stats ? stats[key] : "–"}</strong>
            <Link href={href}>{cta} <ArrowRight size={14} /></Link>
          </article>
        ))}
      </div>
    </div>
  );
}
