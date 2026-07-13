"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarCheck, ClipboardCheck, LayoutDashboard, LayoutList, LogOut, ShieldCheck, UserCog, UserRound, Users } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { ADMIN_ENTRY_KEYS } from "@/lib/iam/admin-entry-keys";
import { P, type PermissionKey } from "@/lib/iam/permission-keys";
import { useSignOut } from "@/lib/use-sign-out";
import { useAuth } from "./auth-provider";
import { ConfirmDialog } from "./confirm-dialog";
import { usePermissions } from "./permissions-provider";

type AdminLink = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission?: PermissionKey;
};

const links: AdminLink[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/verifications", label: "Verification queue", icon: ClipboardCheck, permission: P.KYC_SUBMISSION_READ },
  { href: "/admin/users", label: "Users", icon: Users, permission: P.IDENTITY_USER_READ },
  { href: "/admin/listings", label: "Listings", icon: LayoutList, permission: P.LISTING_LISTING_READ },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck, permission: P.BOOKING_BOOKING_READ },
  { href: "/admin/roles", label: "Roles", icon: ShieldCheck, permission: P.PLATFORM_ROLE_READ },
  { href: "/admin/staff", label: "Staff", icon: UserCog, permission: P.PLATFORM_ASSIGNMENT_READ },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { can, canAny, ready } = usePermissions();
  const { signOut, leaving } = useSignOut();
  const [confirming, setConfirming] = useState(false);
  const [pendingKyc, setPendingKyc] = useState<number | null>(null);

  const hasAdminEntry = ready && canAny(...ADMIN_ENTRY_KEYS);
  useEffect(() => {
    if (!ready || !can(P.KYC_SUBMISSION_READ)) return;
    adminApi.kycQueue(0, 1).then((page) => setPendingKyc(page.totalElements)).catch(() => undefined);
  }, [can, ready]);

  if (loading || !ready) return <main className="page"><div className="container"><div className="admin-access-skeleton" aria-label="Checking staff access"><span /><span /><span /></div></div></main>;
  if (!user || !hasAdminEntry) return <main className="page"><div className="container narrow-page"><section className="empty-state card"><h1>Staff access required</h1><p>You do not currently have permission to open the staff workspace.</p><Link className="button" href={user ? "/" : "/login"}>{user ? "Return home" : "Log in"}</Link></section></div></main>;

  const visibleLinks = links.filter((link) => !link.permission || can(link.permission));

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <p className="admin-sidebar__label">Rentle admin</p>
        <nav>
          {visibleLinks.map(({ href, label, icon: Icon }) => {
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
