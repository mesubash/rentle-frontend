"use client";

import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays, Compass, LayoutList, ListPlus, MessageCircle, Search, UserRound } from "lucide-react";
import { useAuth } from "./auth-provider";
import { BrandLogo } from "./brand-logo";
import { assetUrl } from "@/lib/api/assets";

const nav = [
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/listings/manage", label: "Listings", icon: LayoutList, mobileOnly: true },
  { href: "/profile", label: "Profile", icon: UserRound, mobileOnly: true },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const isAdmin = pathname.startsWith("/admin");
  const profilePhoto = assetUrl(user?.profilePhotoUrl);

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <BrandLogo href={isAdmin ? "/admin/verifications" : "/"} priority inverted />
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
                {item.label}
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
                {profilePhoto ? <Image src={profilePhoto} alt="" width={34} height={34} sizes="34px" /> : initials(user.fullName)}
              </Link>
            )}
          </div>
        </div>
      </header>

      {!isAdmin && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={pathname.startsWith(href) ? "is-active" : ""}>
              <span className="mobile-nav__icon">{href === "/profile" && profilePhoto ? <Image className="mobile-nav__avatar" src={profilePhoto} alt="" width={24} height={24} sizes="24px" /> : <Icon size={21} />}</span>
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
