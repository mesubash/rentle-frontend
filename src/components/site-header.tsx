"use client";

import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, CalendarDays, Compass, LayoutList, ListPlus, LogIn, LogOut, MessageCircle, Search, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "./auth-provider";
import { BrandLogo } from "./brand-logo";
import { ConfirmDialog } from "./confirm-dialog";
import { useSignOut } from "@/lib/use-sign-out";
import { assetUrl } from "@/lib/api/assets";
import type { UserProfile } from "@/lib/api/users";
import { ADMIN_ENTRY_KEYS } from "@/lib/iam/admin-entry-keys";
import { usePermissions } from "./permissions-provider";

const nav = [
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/listings/manage", label: "Listings", icon: LayoutList, mobileOnly: true },
  { href: "/profile", label: "Profile", icon: UserRound, mobileOnly: true },
];
const guestNav = [
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/login", label: "Log in", icon: LogIn },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { canAny, ready } = usePermissions();
  const admin = Boolean(user && ready && canAny(...ADMIN_ENTRY_KEYS));
  const profilePhoto = assetUrl(user?.profilePhotoUrl);
  if (pathname.startsWith("/admin")) return null;
  // Admin navigation lives in the admin sidebar — the header stays clean.
  const desktopNav = admin
    ? []
    : user
      ? nav.filter((item) => !item.mobileOnly)
      : nav.filter((item) => item.href === "/explore");
  const mobileNav = user ? nav : guestNav;

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <BrandLogo href={admin ? "/admin" : "/"} priority inverted />
          {!admin && pathname !== "/" && (
            <Form className="header-search" action="/search">
              <Search size={18} aria-hidden="true" />
              <label className="sr-only" htmlFor="global-search">Search Rentle</label>
              <input id="global-search" name="q" placeholder="Search items, services, districts…" />
            </Form>
          )}
          <nav className="desktop-nav" aria-label="Main navigation">
            {desktopNav.map((item) => (
              <Link key={item.href} href={item.href} className={pathname.startsWith(item.href) ? "is-active" : ""}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            {admin && <span className="admin-label">Admin</span>}
            {ready && !admin && user && <Link className="button button--small button--paper" href="/list"><ListPlus size={17} /> List an item</Link>}
            {ready && !admin && user && <Link className="icon-button header-bell" href="/notifications" aria-label="Notifications"><Bell size={19} /></Link>}
            {!loading && !user && (
              <Link className="button button--small button--paper" href="/login">Log in</Link>
            )}
            {user && <AvatarMenu user={user} profilePhoto={profilePhoto} admin={admin} />}
          </div>
        </div>
      </header>

      {ready && !admin && <nav className={user ? "mobile-nav" : "mobile-nav mobile-nav--guest"} aria-label="Mobile navigation">
        {mobileNav.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={pathname.startsWith(href) ? "is-active" : ""}>
            <span className="mobile-nav__icon">{href === "/profile" && profilePhoto ? <Image className="mobile-nav__avatar" src={profilePhoto} alt="" width={24} height={24} sizes="24px" /> : <Icon size={21} />}</span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>}
    </>
  );
}

function AvatarMenu({ user, profilePhoto, admin }: { user: UserProfile; profilePhoto?: string | null; admin?: boolean }) {
  const { signOut, leaving } = useSignOut();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPress = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPress);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPress);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="avatar-menu" ref={rootRef}>
      <button
        className="avatar avatar--small"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {profilePhoto ? <Image src={profilePhoto} alt="" width={34} height={34} sizes="34px" /> : initials(user.fullName)}
      </button>
      {open && (
        <div className="avatar-menu__list" role="menu">
          <p className="avatar-menu__name">{user.fullName}</p>
          {admin ? (
            <Link role="menuitem" href="/admin" onClick={() => setOpen(false)}><ShieldCheck size={16} /> Admin workspace</Link>
          ) : (
            <>
              <Link role="menuitem" href="/profile" onClick={() => setOpen(false)}><UserRound size={16} /> Profile</Link>
              <Link role="menuitem" href="/listings/manage" onClick={() => setOpen(false)}><LayoutList size={16} /> My listings</Link>
            </>
          )}
          <button role="menuitem" className="avatar-menu__danger" disabled={leaving} onClick={() => setConfirming(true)}><LogOut size={16} /> {leaving ? "Logging out…" : "Log out"}</button>
        </div>
      )}
      <ConfirmDialog
        open={confirming}
        title="Log out of Rentle?"
        message="You can log back in any time."
        confirmLabel={leaving ? "Logging out…" : "Log out"}
        danger
        busy={leaving}
        onConfirm={async () => { await signOut(); setConfirming(false); setOpen(false); }}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}
