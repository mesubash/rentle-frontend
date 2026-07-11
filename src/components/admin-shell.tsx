"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, ClipboardCheck, LayoutList, Users } from "lucide-react";
import { useAuth } from "./auth-provider";

const links = [{ href: "/admin/verifications", label: "Verification queue", icon: ClipboardCheck }, { href: "/admin/users", label: "Users", icon: Users }, { href: "/admin/listings", label: "Listings", icon: LayoutList }, { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck }];
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  if (loading) return <main className="page"><div className="container"><p>Checking admin access…</p></div></main>;
  if (!user || user.role !== "ADMIN") return <main className="page"><div className="container narrow-page"><section className="empty-state card"><h1>Admin access required</h1><p>This workspace is available only to Rentle administrators.</p><Link className="button" href="/login">Log in with an admin account</Link></section></div></main>;
  return <main className="admin-shell"><aside className="admin-sidebar"><nav>{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={pathname.startsWith(href) ? "is-active" : ""}><Icon size={18} />{label}</Link>)}</nav></aside><section className="admin-content">{children}</section></main>;
}
