"use client";

import Form from "next/form";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays, Compass, LayoutList, ListPlus, MessageCircle, Search, UserRound } from "lucide-react";
import { useAuth } from "./auth-provider";

const nav = [
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/messages", label: "Messages", icon: MessageCircle, badge: 2 },
  { href: "/listings/manage", label: "Listings", icon: LayoutList, mobileOnly: true },
  { href: "/profile", label: "Profile", icon: UserRound, mobileOnly: true },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <Link className="brand" href={isAdmin ? "/admin/verifications" : "/"} aria-label="Rentle home">Rentle</Link>
          {!isAdmin && (
            <Form className="header-search" action="/search">
              <Search size={18} aria-hidden="true" />
              <label className="sr-only" htmlFor="global-search">Search Rentle</label>
              <input id="global-search" name="q" placeholder="Search items, services, districts…" />
            </Form>
          )}
          <nav className="desktop-nav" aria-label="Main navigation">
            {isAdmin ? (
              <span className="admin-label">Admin workspace</span>
            ) : nav.filter((item) => !item.mobileOnly).map((item) => (
              <Link key={item.href} href={item.href} className={pathname.startsWith(item.href) ? "is-active" : ""}>
                {item.label}{item.badge ? <span className="nav-badge">{item.badge}</span> : null}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            {!isAdmin && <Link className="button button--small button--paper" href="/list"><ListPlus size={17} /> List an item</Link>}
            <Link className="icon-button header-bell" href="/notifications" aria-label="Notifications"><Bell size={19} /></Link>
            {!loading && !user && !isAdmin && (
              <Link className="button button--small button--paper" href="/auth/login">Log in</Link>
            )}
            {user && (
              <Link className="avatar avatar--small" href="/profile" aria-label="My profile">
                {initials(user.fullName)}
              </Link>
            )}
          </div>
        </div>
      </header>

      {!isAdmin && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {nav.map(({ href, label, icon: Icon, badge }) => (
            <Link key={href} href={href} className={pathname.startsWith(href) ? "is-active" : ""}>
              <span className="mobile-nav__icon"><Icon size={21} />{badge ? <span className="nav-badge">{badge}</span> : null}</span>
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}
