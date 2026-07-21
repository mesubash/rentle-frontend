"use client";

import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { Building2, CalendarDays, Check, Compass, LayoutList, ListPlus, LogOut, Menu, MessageCircle, Plus, Search, Settings, ShieldCheck, UserRound, X } from "lucide-react";
import { useAuth } from "./auth-provider";
import { useOrg } from "./org-provider";
import { BrandLogo } from "./brand-logo";
import dynamic from "next/dynamic";
import { useSignOut } from "@/lib/use-sign-out";
import { assetUrl } from "@/lib/api/assets";
import { messagesApi } from "@/lib/api/messages";
import { notificationsApi } from "@/lib/api/notifications";
import type { UserProfile } from "@/lib/api/users";
import { ADMIN_ENTRY_KEYS } from "@/lib/iam/admin-entry-keys";
import { usePermissions } from "./permissions-provider";
import { initials } from "@/lib/format";
// Split out of the shared chunk: the header is in the root layout, so statically
// importing these put ~440 lines of closed-by-default UI into every route's bundle,
// including logged-out marketing pages. All three already render only after `ready`
// (or after a confirm is triggered), so deferring the chunk adds no new layout shift.
const NotificationsPopover = dynamic(() => import("./notifications-popover").then((m) => m.NotificationsPopover), {
  loading: () => <span className="icon-button header-expandable" aria-hidden="true" />,
});
const SavedPopover = dynamic(() => import("./saved-popover").then((m) => m.SavedPopover), {
  loading: () => <span className="icon-button header-expandable" aria-hidden="true" />,
});
const ConfirmDialog = dynamic(() => import("./confirm-dialog").then((m) => m.ConfirmDialog));

const nav = [
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/listings/manage", label: "Listings", icon: LayoutList, mobileOnly: true },
  { href: "/profile", label: "Profile", icon: UserRound, mobileOnly: true },
];
const mobilePrimaryNav = nav.filter((item) => ["/explore", "/bookings", "/messages"].includes(item.href));

export function SiteHeader() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { canAny, ready } = usePermissions();
  const admin = Boolean(user && ready && canAny(...ADMIN_ENTRY_KEYS));
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  // Stable identities: both popovers list onOpenChange in the dep array of the effect
  // that loads their contents, so an inline arrow refetched on every header re-render.
  const handleSavedOpenChange = useCallback((open: boolean) => {
    setSavedOpen(open);
    if (open) setNotificationsOpen(false);
  }, []);
  const handleNotificationsOpenChange = useCallback((open: boolean) => {
    setNotificationsOpen(open);
    if (open) setSavedOpen(false);
  }, []);
  const [messageUnreadCount, setMessageUnreadCount] = useState(0);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const userId = user?.id;
  const profilePhoto = assetUrl(user?.profilePhotoUrl);
  const showHeaderSearch = !admin && (
    pathname === "/explore" ||
    pathname === "/search" ||
    pathname === "/favorites" ||
    pathname.startsWith("/listing/")
  );

  useEffect(() => {
    if (!userId || !ready || admin) return;

    let active = true;
    const refreshUnreadCounts = () => {
      notificationsApi
        .unreadCount()
        .then((count) => {
          if (active) setNotificationUnreadCount(Math.max(0, count));
        })
        .catch(() => {
          // The header remains usable when the background count request fails.
        });
      messagesApi
        .unreadCount()
        .then(({ count }) => {
          if (active) setMessageUnreadCount(Math.max(0, count));
        })
        .catch(() => {
          // Message navigation remains usable when the background count request fails.
        });
    };

    refreshUnreadCounts();
    // Poll only while the tab is actually being looked at. Without this the pair of count
    // requests ran every 60s forever in every background tab, on every route.
    const tick = () => {
      if (document.visibilityState === "visible") refreshUnreadCounts();
    };
    const intervalId = window.setInterval(tick, 60_000);
    // Refresh on return so a tab that was hidden for a while isn't showing a stale badge.
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refreshUnreadCounts();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [admin, ready, userId]);

  useEffect(() => {
    if (!mobileMoreOpen) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setMobileMoreOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileMoreOpen]);

  if (pathname.startsWith("/admin")) return null;
  // Admin navigation lives in the admin sidebar — the header stays clean.
  const desktopNav = admin
    ? []
    : user
      ? nav.filter((item) => !item.mobileOnly && item.href !== "/messages")
      : [];

  return (
    <>
      <header className="site-header">
        <div className={showHeaderSearch ? "site-header__inner has-search" : "site-header__inner is-compact"}>
          <BrandLogo href={admin ? "/admin" : "/"} priority inverted />
          {showHeaderSearch && (
            <Form className="header-search" action="/search">
              <Search size={18} aria-hidden="true" />
              <label className="sr-only" htmlFor="global-search">Search Rentle</label>
              <input id="global-search" name="q" placeholder="Search items, services, districts…" />
            </Form>
          )}
          <nav className="desktop-nav" aria-label="Main navigation">
            {desktopNav.map((item) => {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={pathname.startsWith(item.href) ? "is-active" : ""}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className={ready && !admin && user ? "header-actions header-actions--member" : "header-actions"}>
            {admin && <span className="admin-label">Admin</span>}
            {ready && !admin && user && <Link className="button button--small button--paper header-listing-action" href="/list" aria-label="List an item"><ListPlus size={17} /><span>List an item</span></Link>}
            {ready && !admin && user && (
              <Link
                className="icon-button header-utility header-expandable"
                href="/messages"
                aria-label={messageUnreadCount > 0 ? `Messages, ${messageUnreadCount} unread` : "Messages"}
                onPointerUp={(event) => event.currentTarget.blur()}
              >
                <MessageCircle size={19} />
                <span className="header-action-label">Messages</span>
                {messageUnreadCount > 0 && <span className="nav-badge" aria-hidden="true">{messageUnreadCount > 99 ? "99+" : messageUnreadCount}</span>}
              </Link>
            )}
            {ready && !admin && user && (
              <SavedPopover
                open={savedOpen}
                onOpenChange={handleSavedOpenChange}
              />
            )}
            {ready && !admin && user && (
              <NotificationsPopover
                open={notificationsOpen}
                unreadCount={notificationUnreadCount}
                onOpenChange={handleNotificationsOpenChange}
                onUnreadCountChange={setNotificationUnreadCount}
              />
            )}
            {!loading && !user && !admin && <Link className="header-guest-explore" href="/explore">Explore</Link>}
            {!loading && !user && (
              <Link className="button button--small button--paper header-login" href="/login">Log in</Link>
            )}
            {user && <AvatarMenu user={user} profilePhoto={profilePhoto} admin={admin} />}
          </div>
        </div>
      </header>

      {ready && !admin && user && <nav className="mobile-nav" aria-label="Mobile navigation">
        {mobilePrimaryNav.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={pathname.startsWith(href) ? "is-active" : ""} aria-label={href === "/messages" && messageUnreadCount > 0 ? `Messages, ${messageUnreadCount} unread` : undefined}>
            <span className="mobile-nav__icon"><Icon size={21} />{href === "/messages" && messageUnreadCount > 0 && <span className="nav-badge" aria-hidden="true">{messageUnreadCount > 99 ? "99+" : messageUnreadCount}</span>}</span>
            <span>{label}</span>
          </Link>
        ))}
        <button type="button" className={mobileMoreOpen || pathname.startsWith("/profile") || pathname.startsWith("/listings") ? "mobile-nav__more is-active" : "mobile-nav__more"} aria-expanded={mobileMoreOpen} aria-controls="mobile-more-menu" onClick={() => setMobileMoreOpen((open) => !open)}>
          <span className="mobile-nav__icon">{profilePhoto ? <Image className="mobile-nav__avatar" src={profilePhoto} alt="" width={24} height={24} sizes="24px" /> : <Menu size={21} />}</span>
          <span>More</span>
        </button>
      </nav>}

      {ready && !admin && user && mobileMoreOpen && <>
        <button type="button" className="mobile-more-backdrop" aria-label="Close more navigation" onClick={() => setMobileMoreOpen(false)} />
        <aside className="mobile-more" id="mobile-more-menu" aria-label="More navigation">
          <header><strong>More</strong><button type="button" className="icon-button" aria-label="Close more navigation" onClick={() => setMobileMoreOpen(false)}><X size={20} /></button></header>
          <nav>
            <Link href="/list" onClick={() => setMobileMoreOpen(false)}><ListPlus size={19} /><span><strong>List an item</strong><small>Create a product or service listing</small></span></Link>
            <Link href="/listings/manage" onClick={() => setMobileMoreOpen(false)}><LayoutList size={19} /><span><strong>My listings</strong><small>Update listings and availability</small></span></Link>
            <Link href="/profile" onClick={() => setMobileMoreOpen(false)}><UserRound size={19} /><span><strong>Profile</strong><small>Account and verification</small></span></Link>
          </nav>
        </aside>
      </>}
    </>
  );
}

function AvatarMenu({ user, profilePhoto, admin }: { user: UserProfile; profilePhoto?: string | null; admin?: boolean }) {
  const { signOut, leaving } = useSignOut();
  const { orgs, activeOrgId, activeOrg, setActiveOrgId } = useOrg();
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
        className={activeOrg ? "avatar avatar--small avatar--org" : "avatar avatar--small"}
        aria-label={activeOrg ? `Account menu — acting as ${activeOrg.name}` : "Account menu"}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {profilePhoto ? <Image src={profilePhoto} alt="" width={34} height={34} sizes="34px" /> : initials(user.fullName)}
        {activeOrg && <span className="avatar__org-badge" aria-hidden="true"><Building2 size={11} /></span>}
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
              <p className="avatar-menu__label">Acting as</p>
              <button role="menuitemradio" aria-checked={!activeOrgId} onClick={() => { setActiveOrgId(null); setOpen(false); }}>
                <UserRound size={16} /> <span className="avatar-menu__grow">Personal</span> {!activeOrgId && <Check size={15} />}
              </button>
              {orgs.map((org) => (
                <button key={org.id} role="menuitemradio" aria-checked={activeOrgId === org.id}
                        onClick={() => { setActiveOrgId(org.id); setOpen(false); }}>
                  <Building2 size={16} /> <span className="avatar-menu__grow">{org.name}</span> {activeOrgId === org.id && <Check size={15} />}
                </button>
              ))}
              {activeOrg && (
                <Link role="menuitem" href={`/organizations/${activeOrg.id}`} onClick={() => setOpen(false)}>
                  <Settings size={16} /> Manage {activeOrg.name}
                </Link>
              )}
              <Link role="menuitem" href="/organizations/new" onClick={() => setOpen(false)}><Plus size={16} /> Create organization</Link>
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

