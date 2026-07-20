"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  Building2,
  ChevronsUpDown,
  ClipboardCheck,
  Edit3,
  ExternalLink,
  LayoutDashboard,
  Flag,
  Layers,
  LayoutList,
  Receipt,
  Settings,
  LogOut,
  Menu,
  PanelLeftIcon,
  ShieldCheck,
  UserCog,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { ADMIN_ENTRY_KEYS } from "@/lib/iam/admin-entry-keys";
import { P, type PermissionKey } from "@/lib/iam/permission-keys";
import { useSignOut } from "@/lib/use-sign-out";
import { cn } from "@/lib/utils";
import { BrandLogo } from "./brand-logo";
import { ConfirmDialog } from "./confirm-dialog";
import { useAuth } from "./auth-provider";
import { usePermissions } from "./permissions-provider";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type AdminLink = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission?: PermissionKey;
  badge?: "kyc";
};

const navGroups: Array<{ label: string; links: AdminLink[] }> = [
  {
    label: "Overview",
    links: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Marketplace",
    links: [
      { href: "/admin/verifications", label: "Verification queue", icon: ClipboardCheck, permission: P.KYC_SUBMISSION_READ, badge: "kyc" },
      { href: "/admin/users", label: "Users", icon: Users, permission: P.IDENTITY_USER_READ },
      { href: "/admin/organizations", label: "Organizations", icon: Building2, permission: P.PLATFORM_ORGANIZATION_READ },
      { href: "/admin/listings", label: "Listings", icon: LayoutList, permission: P.LISTING_LISTING_READ },
      { href: "/admin/categories", label: "Categories", icon: Layers, permission: P.LISTING_CATEGORY_MANAGE },
      { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck, permission: P.BOOKING_BOOKING_READ },
      { href: "/admin/reports", label: "Reports", icon: Flag, permission: P.TRUST_REPORT_READ },
      { href: "/admin/provider-verifications", label: "Provider checks", icon: ShieldCheck, permission: P.KYC_SUBMISSION_READ },
    ],
  },
  {
    label: "Platform",
    links: [
      { href: "/admin/fees", label: "Fees", icon: Receipt, permission: P.BOOKING_FEE_MANAGE },
      { href: "/admin/settings", label: "Settings", icon: Settings, permission: P.PLATFORM_SETTINGS_MANAGE },
    ],
  },
  {
    label: "Access management",
    links: [
      { href: "/admin/roles", label: "Roles", icon: ShieldCheck, permission: P.PLATFORM_ROLE_READ },
      { href: "/admin/staff", label: "Staff assignments", icon: UserCog, permission: P.PLATFORM_ASSIGNMENT_READ },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { can, canAny, ready } = usePermissions();
  const { signOut, leaving } = useSignOut();
  const [confirming, setConfirming] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [pendingKyc, setPendingKyc] = useState<number | null>(null);

  const hasAdminEntry = ready && canAny(...ADMIN_ENTRY_KEYS);
  useEffect(() => {
    if (!ready || !can(P.KYC_SUBMISSION_READ)) return;
    adminApi.kycQueue(0, 1).then((page) => setPendingKyc(page.totalElements)).catch(() => undefined);
  }, [can, ready]);

  const visibleGroups = useMemo(() => navGroups.map((group) => ({
    ...group,
    links: group.links.filter((link) => !link.permission || can(link.permission)),
  })).filter((group) => group.links.length), [can]);

  const currentPage = visibleGroups.flatMap((group) => group.links).find((link) =>
    link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href),
  )?.label ?? (pathname.startsWith("/admin/profile") ? "Profile" : "Admin");

  if (loading || !ready) {
    return (
      <div className="admin-app-loading">
        <aside><Skeleton className="h-9 w-28" />{[0, 1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-9 w-full" />)}</aside>
        <main><Skeleton className="h-12 w-full" /><Skeleton className="mt-8 h-72 w-full" /></main>
      </div>
    );
  }

  if (!user || !hasAdminEntry) {
    return (
      <main className="grid min-h-screen place-items-center bg-background p-6">
        <section className="w-full max-w-md rounded-lg border bg-card p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto mb-4 size-10 text-muted-foreground" />
          <h1 className="text-2xl! font-bold tracking-tight">Staff access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">You do not currently have permission to open the staff workspace.</p>
          <Button className="mt-5" asChild><Link href={user ? "/" : "/login"}>{user ? "Return home" : "Log in"}</Link></Button>
        </section>
      </main>
    );
  }

  const sidebar = (
    <>
      <div className="admin-sidebar-brand">
        <BrandLogo href="/admin" priority />
        <div className="admin-sidebar-brand__copy">
          <strong>Rentle</strong>
          <span>Admin console</span>
        </div>
        <button className="admin-sidebar-mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X /></button>
      </div>

      <div className="admin-sidebar-nav">
        {visibleGroups.map((group) => (
          <div className="admin-nav-group" key={group.label}>
            <p>{group.label}</p>
            <nav aria-label={group.label}>
              {group.links.map(({ href, label, icon: Icon, badge }) => {
                const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
                return (
                  <Link key={href} href={href} className={cn("admin-nav-link", active && "is-active")} title={collapsed ? label : undefined} onClick={() => setMobileOpen(false)}>
                    <Icon />
                    <span>{label}</span>
                    {badge === "kyc" && pendingKyc ? <Badge>{pendingKyc}</Badge> : null}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="admin-sidebar-user">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="admin-user-card" aria-label="Open account menu">
              <span className="admin-user-avatar">{initials(user.fullName)}</span>
              <span className="admin-user-copy"><strong>{user.fullName}</strong><small>{user.email}</small></span>
              <ChevronsUpDown />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" side="right" align="end" sideOffset={8}>
            <DropdownMenuLabel className="font-normal">
              <span className="block truncate font-semibold">{user.fullName}</span>
              <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/admin/profile" onClick={() => setMobileOpen(false)}><UserRound /> Profile</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/profile/edit" onClick={() => setMobileOpen(false)}><Edit3 /> Edit profile</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/" target="_blank"><ExternalLink /> View marketplace</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:bg-red-50 focus:text-destructive" disabled={leaving} onSelect={() => setConfirming(true)}>
              <LogOut /> {leaving ? "Logging out…" : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );

  return (
    <div className={cn("admin-app", collapsed && "is-collapsed")}>
      <aside className="admin-desktop-sidebar">{sidebar}</aside>
      {mobileOpen && <button className="admin-sidebar-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside className={cn("admin-mobile-sidebar", mobileOpen && "is-open")}>{sidebar}</aside>

      <div className="admin-workspace">
        <header className="admin-topbar">
          <div className="admin-topbar__start">
            <Button className="md:hidden" variant="outline" size="icon" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu /></Button>
            <Button className="hidden md:inline-flex" variant="outline" size="icon" aria-label={collapsed ? "Expand navigation" : "Collapse navigation"} onClick={() => setCollapsed((value) => !value)}>
              <PanelLeftIcon />
            </Button>
            <span className="admin-topbar-divider" />
            <div><span>Workspace</span><strong>{currentPage}</strong></div>
          </div>
          <Button asChild variant="ghost" size="sm"><Link href="/" target="_blank">Marketplace <ExternalLink /></Link></Button>
        </header>
        <main className="admin-main" id="admin-main">{children}</main>
      </div>

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
    </div>
  );
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}
