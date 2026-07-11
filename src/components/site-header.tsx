"use client";

import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, CalendarDays, Compass, LayoutList, ListPlus, LogIn, LogOut, MessageCircle, Search, ShieldCheck, UserRound, Users } from "lucide-react";
import { useAuth } from "./auth-provider";
import { BrandLogo } from "./brand-logo";
import { ConfirmDialog } from "./confirm-dialog";
import { useToast } from "./toast-provider";
import { assetUrl } from "@/lib/api/assets";
import type { UserProfile } from "@/lib/api/users";

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
const adminNav = [
  { href: "/admin/verifications", label: "Verifications", icon: ShieldCheck },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/listings", label: "Listings", icon: LayoutList },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  // Drive chrome by ROLE, not path — an admin sees the admin workspace everywhere.
  const admin = user?.role === "ADMIN";
  const profilePhoto = assetUrl(user?.profilePhotoUrl);
  const desktopNav = admin
    ? adminNav
    : user
      ? nav.filter((item) => !item.mobileOnly)
      : nav.filter((item) => item.href === "/explore");
  const mobileNav = admin ? adminNav : user ? nav : guestNav;

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <BrandLogo href={admin ? "/admin/verifications" : "/"} priority inverted />
          {!admin && (
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
            {!admin && user && <Link className="button button--small button--paper" href="/list"><ListPlus size={17} /> List an item</Link>}
            {!admin && user && <Link className="icon-button header-bell" href="/notifications" aria-label="Notifications"><Bell size={19} /></Link>}
            {!loading && !user && (
              <Link className="button button--small button--paper" href="/login">Log in</Link>
            )}
            {user && <AvatarMenu user={user} profilePhoto={profilePhoto} admin={admin} />}
          </div>
        </div>
      </header>

      <nav className={admin ? "mobile-nav" : user ? "mobile-nav" : "mobile-nav mobile-nav--guest"} aria-label="Mobile navigation">
        {mobileNav.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={pathname.startsWith(href) ? "is-active" : ""}>
            <span className="mobile-nav__icon">{href === "/profile" && profilePhoto ? <Image className="mobile-nav__avatar" src={profilePhoto} alt="" width={24} height={24} sizes="24px" /> : <Icon size={21} />}</span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}

function AvatarMenu({ user, profilePhoto, admin }: { user: UserProfile; profilePhoto?: string | null; admin?: boolean }) {
  const router = useRouter();
  const { logout } = useAuth();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [leaving, setLeaving] = useState(false);
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

  async function signOut() {
    setLeaving(true);
    try {
      await logout();
      showToast("Logged out!", { tone: "success" });
    } catch {
      showToast("You were logged out on this device, but the server could not be reached.", { tone: "info" });
    } finally {
      setConfirming(false);
      setOpen(false);
      setLeaving(false);
      router.push("/");
      router.refresh();
    }
  }

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
            <Link role="menuitem" href="/admin/verifications" onClick={() => setOpen(false)}><ShieldCheck size={16} /> Admin workspace</Link>
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
        onConfirm={signOut}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}
