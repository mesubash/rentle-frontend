"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarCheck, ClipboardCheck, LayoutDashboard, LayoutList, LogOut, UserRound, Users } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { useSignOut } from "@/lib/use-sign-out";
import { useAuth } from "./auth-provider";
import { ConfirmDialog } from "./confirm-dialog";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/verifications", label: "Verification queue", icon: ClipboardCheck },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/listings", label: "Listings", icon: LayoutList },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { signOut, leaving } = useSignOut();
  const [confirming, setConfirming] = useState(false);
  const [pendingKyc, setPendingKyc] = useState<number | null>(null);

  const isAdmin = Boolean(user && user.role === "ADMIN");
  useEffect(() => {
    if (!isAdmin) return;
    adminApi.kycQueue(0, 1).then((page) => setPendingKyc(page.totalElements)).catch(() => undefined);
  }, [isAdmin]);

  if (loading) return <main className="page"><div className="container"><p>Checking admin access…</p></div></main>;
  if (!user || user.role !== "ADMIN") return <main className="page"><div className="container narrow-page"><section className="empty-state card"><h1>Admin access required</h1><p>This workspace is available only to Rentle administrators.</p><Link className="button" href="/login">Log in with an admin account</Link></section></div></main>;

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <p className="admin-sidebar__label">Rentle admin</p>
        <nav>
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={active ? "is-active" : ""}>
                <Icon size={18} />{label}
                {href === "/admin/verifications" && pendingKyc ? <span className="admin-sidebar__badge">{pendingKyc}</span> : null}
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar__footer">
          <Link href="/admin/profile" className={pathname.startsWith("/admin/profile") ? "is-active" : ""}><UserRound size={18} /> Profile</Link>
          <button disabled={leaving} onClick={() => setConfirming(true)}><LogOut size={18} /> {leaving ? "Logging out…" : "Log out"}</button>
        </div>
      </aside>
      <section className="admin-content">{children}</section>
      <ConfirmDialog
        open={confirming}
        title="Log out of Rentle?"
        message="You can log back in any time."
        confirmLabel={leaving ? "Logging out…" : "Log out"}
        danger
        busy={leaving}
        onConfirm={async () => { await signOut(); setConfirming(false); }}
        onCancel={() => setConfirming(false)}
      />
    </main>
  );
}
