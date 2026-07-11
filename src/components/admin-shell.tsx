"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, ClipboardCheck, LayoutList, Users } from "lucide-react";

const links = [{ href: "/admin/verifications", label: "Verification queue", icon: ClipboardCheck }, { href: "/admin/users", label: "Users", icon: Users }, { href: "/admin/listings", label: "Listings", icon: LayoutList }, { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck }];
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <main className="admin-shell"><aside className="admin-sidebar"><nav>{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={pathname.startsWith(href) ? "is-active" : ""}><Icon size={18} />{label}</Link>)}</nav></aside><section className="admin-content">{children}</section></main>;
}
