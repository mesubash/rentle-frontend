"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarCheck,
  CircleGauge,
  ClipboardCheck,
  KeyRound,
  LayoutList,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import type { Booking } from "@/lib/api/bookings";
import type { KycAdminRow } from "@/lib/api/kyc";
import type { ListingSummary } from "@/lib/api/listings";
import { platformApi } from "@/lib/api/platform";
import type { UserProfile } from "@/lib/api/users";
import { P, type PermissionKey } from "@/lib/iam/permission-keys";
import { useAuth } from "./auth-provider";
import { AdminPageHeader } from "./admin-ui";
import { usePermissions } from "./permissions-provider";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

type Stats = {
  pendingKyc: number;
  users: number;
  listings: number;
  bookings: number;
};

type AccessStats = {
  roles: number;
  assignments: number;
};

type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  href: string;
  label: string;
  icon: typeof Users;
};

const metrics: Array<{
  key: keyof Stats;
  label: string;
  description: string;
  href: string;
  permission: PermissionKey;
  icon: typeof Users;
  attention?: boolean;
}> = [
  {
    key: "pendingKyc",
    label: "Pending verifications",
    description: "Waiting for identity review",
    href: "/admin/verifications",
    permission: P.KYC_SUBMISSION_READ,
    icon: ClipboardCheck,
    attention: true,
  },
  {
    key: "users",
    label: "Registered users",
    description: "Accounts across Rentle",
    href: "/admin/users",
    permission: P.IDENTITY_USER_READ,
    icon: Users,
  },
  {
    key: "listings",
    label: "Marketplace listings",
    description: "Across every listing state",
    href: "/admin/listings",
    permission: P.LISTING_LISTING_READ,
    icon: LayoutList,
  },
  {
    key: "bookings",
    label: "Bookings",
    description: "Marketplace agreements",
    href: "/admin/bookings",
    permission: P.BOOKING_BOOKING_READ,
    icon: CalendarCheck,
  },
];

export function AdminDashboard() {
  const { user } = useAuth();
  const { can, permissions } = usePermissions();
  const [stats, setStats] = useState<Partial<Stats>>({});
  const [accessStats, setAccessStats] = useState<Partial<AccessStats>>({});
  const [kycRows, setKycRows] = useState<KycAdminRow[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      const jobs: Promise<void>[] = [];

      if (can(P.KYC_SUBMISSION_READ)) {
        jobs.push(adminApi.kycQueue(0, 5).then((page) => {
          if (!active) return;
          setStats((current) => ({ ...current, pendingKyc: page.totalElements }));
          setKycRows(page.content);
        }));
      }

      if (can(P.IDENTITY_USER_READ)) {
        jobs.push(adminApi.users(undefined, 0, 5).then((page) => {
          if (!active) return;
          setStats((current) => ({ ...current, users: page.totalElements }));
          setUsers(page.content);
        }));
      }

      if (can(P.LISTING_LISTING_READ)) {
        jobs.push(adminApi.listings(0, 5).then((page) => {
          if (!active) return;
          setStats((current) => ({ ...current, listings: page.totalElements }));
          setListings(page.content);
        }));
      }

      if (can(P.BOOKING_BOOKING_READ)) {
        jobs.push(adminApi.bookings(0, 5).then((page) => {
          if (!active) return;
          setStats((current) => ({ ...current, bookings: page.totalElements }));
          setBookings(page.content);
        }));
      }

      if (can(P.PLATFORM_ROLE_READ)) {
        jobs.push(platformApi.roles().then((roles) => {
          if (active) setAccessStats((current) => ({ ...current, roles: roles.length }));
        }));
      }

      if (can(P.PLATFORM_ASSIGNMENT_READ)) {
        jobs.push(platformApi.assignments().then((assignments) => {
          if (active) setAccessStats((current) => ({ ...current, assignments: assignments.length }));
        }));
      }

      const results = await Promise.allSettled(jobs);
      if (!active) return;
      if (results.some((result) => result.status === "rejected")) {
        setError("Some dashboard data could not be loaded. The available sections are still current.");
      }
      setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, [can]);

  const visibleMetrics = metrics.filter((metric) => can(metric.permission));
  const hasAccessView = can(P.PLATFORM_ROLE_READ) || can(P.PLATFORM_ASSIGNMENT_READ);
  const recentActivity = useMemo(
    () => buildRecentActivity({ kycRows, users, listings, bookings }),
    [bookings, kycRows, listings, users],
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        description={`${user ? `Welcome back, ${user.fullName.split(" ")[0]}. ` : ""}Here’s a live view of the marketplace areas you can manage.`}
        actions={<DashboardPrimaryAction can={can} pendingKyc={stats.pendingKyc} />}
      />

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-5">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {hasAccessView && <TabsTrigger value="access">Access control</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Marketplace totals">
            {visibleMetrics.map((metric) => (
              <MetricCard
                key={metric.key}
                metric={metric}
                value={stats[metric.key]}
                loading={loading}
              />
            ))}
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle>Operational pulse</CardTitle>
                    <CardDescription>Live totals from the areas available to you.</CardDescription>
                  </div>
                  <CircleGauge className="size-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-5">
                    {[0, 1, 2, 3].slice(0, visibleMetrics.length).map((item) => <Skeleton className="h-10" key={item} />)}
                  </div>
                ) : (
                  <OperationalPulse metrics={visibleMetrics} stats={stats} />
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Recent activity</CardTitle>
                <CardDescription>Newest records across your operational scope.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">{[0, 1, 2, 3].map((item) => <Skeleton className="h-12" key={item} />)}</div>
                ) : recentActivity.length ? (
                  <div className="space-y-1">
                    {recentActivity.map((activity) => <ActivityRow activity={activity} key={activity.id} />)}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed px-4 py-8 text-center">
                    <BookOpenCheck className="mx-auto mb-3 size-5 text-muted-foreground" />
                    <p className="text-sm font-medium">No recent records</p>
                    <p className="mt-1 text-xs text-muted-foreground">New marketplace activity will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        {hasAccessView && (
          <TabsContent value="access" className="space-y-4">
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {can(P.PLATFORM_ROLE_READ) && (
                <AccessMetricCard
                  title="Role bundles"
                  description="Named permission sets"
                  value={accessStats.roles}
                  loading={loading}
                  href="/admin/roles"
                  icon={ShieldCheck}
                />
              )}
              {can(P.PLATFORM_ASSIGNMENT_READ) && (
                <AccessMetricCard
                  title="Live assignments"
                  description="Active staff grants"
                  value={accessStats.assignments}
                  loading={loading}
                  href="/admin/staff"
                  icon={UserCog}
                />
              )}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Your resolved access</CardTitle>
                  <KeyRound className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums">{permissions.size}</div>
                  <p className="text-xs text-muted-foreground">Permission keys available now</p>
                </CardContent>
              </Card>
            </section>

            <Card>
              <CardHeader>
                <CardTitle>Access administration</CardTitle>
                <CardDescription>Keep responsibilities explicit and grants easy to audit.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                {can(P.PLATFORM_ROLE_READ) && (
                  <AccessLink
                    href="/admin/roles"
                    title="Manage role bundles"
                    description="Review permission matrices and maintain non-system roles."
                    icon={ShieldCheck}
                  />
                )}
                {can(P.PLATFORM_ASSIGNMENT_READ) && (
                  <AccessLink
                    href="/admin/staff"
                    title="Review staff assignments"
                    description="See who has access and when each role was granted."
                    icon={UserCog}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function DashboardPrimaryAction({
  can,
  pendingKyc,
}: {
  can: (permission: PermissionKey) => boolean;
  pendingKyc?: number;
}) {
  if (can(P.KYC_SUBMISSION_READ) && pendingKyc) {
    return (
      <Button asChild>
        <Link href="/admin/verifications">Review {pendingKyc} waiting <ArrowRight /></Link>
      </Button>
    );
  }
  if (can(P.PLATFORM_ASSIGNMENT_READ)) {
    return <Button asChild variant="outline"><Link href="/admin/staff">Open staff access <ArrowRight /></Link></Button>;
  }
  return null;
}

function MetricCard({
  metric,
  value,
  loading,
}: {
  metric: (typeof metrics)[number];
  value?: number;
  loading: boolean;
}) {
  const Icon = metric.icon;
  const attention = metric.attention && Boolean(value);
  return (
    <Card className={attention ? "border-[var(--marigold)] bg-[var(--marigold-wash)]/45" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
        <span className={`grid size-8 place-items-center rounded-md ${attention ? "bg-[var(--marigold)]/20 text-[var(--marigold-dark)]" : "bg-secondary text-secondary-foreground"}`}>
          <Icon className="size-4" />
        </span>
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="mb-2 h-8 w-20" /> : <div className="text-2xl font-bold tabular-nums">{formatNumber(value)}</div>}
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">{metric.description}</p>
          <Link className="shrink-0 text-xs font-medium text-primary hover:underline" href={metric.href}>View</Link>
        </div>
      </CardContent>
    </Card>
  );
}

function OperationalPulse({
  metrics: visibleMetrics,
  stats,
}: {
  metrics: typeof metrics;
  stats: Partial<Stats>;
}) {
  const max = Math.max(1, ...visibleMetrics.map((metric) => stats[metric.key] ?? 0));
  return (
    <div className="space-y-5">
      {visibleMetrics.map((metric) => {
        const value = stats[metric.key] ?? 0;
        const width = value ? Math.max(5, Math.round((value / max) * 100)) : 0;
        return (
          <Link className="group block" href={metric.href} key={metric.key}>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="font-medium group-hover:text-primary">{metric.label}</span>
              <span className="tabular-nums text-muted-foreground">{formatNumber(value)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${width}%` }} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function ActivityRow({ activity }: { activity: ActivityItem }) {
  const Icon = activity.icon;
  return (
    <Link className="group flex items-start gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-accent" href={activity.href}>
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium group-hover:text-primary">{activity.title}</span>
        <span className="mt-1 block truncate text-xs text-muted-foreground">{activity.detail}</span>
      </span>
      <span className="shrink-0 text-right">
        <Badge variant="outline" className="mb-1 block font-normal">{activity.label}</Badge>
        <time className="block text-[11px] text-muted-foreground">{formatShortDate(activity.timestamp)}</time>
      </span>
    </Link>
  );
}

function AccessMetricCard({
  title,
  description,
  value,
  loading,
  href,
  icon: Icon,
}: {
  title: string;
  description: string;
  value?: number;
  loading: boolean;
  href: string;
  icon: typeof ShieldCheck;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="mb-2 h-8 w-16" /> : <div className="text-2xl font-bold tabular-nums">{formatNumber(value)}</div>}
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">{description}</p>
          <Link className="text-xs font-medium text-primary hover:underline" href={href}>Open</Link>
        </div>
      </CardContent>
    </Card>
  );
}

function AccessLink({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: typeof ShieldCheck;
}) {
  return (
    <Link className="group flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-accent" href={href}>
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground"><Icon className="size-5" /></span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-3 font-medium group-hover:text-primary">{title}<ArrowRight className="size-4" /></span>
        <span className="mt-1 block text-sm text-muted-foreground">{description}</span>
      </span>
    </Link>
  );
}

function buildRecentActivity({
  kycRows,
  users,
  listings,
  bookings,
}: {
  kycRows: KycAdminRow[];
  users: UserProfile[];
  listings: ListingSummary[];
  bookings: Booking[];
}) {
  const activity: ActivityItem[] = [
    ...kycRows.map((row) => ({
      id: `kyc-${row.userId}`,
      title: `${row.realName} submitted identity details`,
      detail: row.email,
      timestamp: row.submittedAt,
      href: "/admin/verifications",
      label: "KYC",
      icon: ClipboardCheck,
    })),
    ...users.map((person) => ({
      id: `user-${person.id}`,
      title: `${person.fullName} joined Rentle`,
      detail: person.email,
      timestamp: person.createdAt,
      href: "/admin/users",
      label: humanize(person.status),
      icon: Users,
    })),
    ...listings.map((listing) => ({
      id: `listing-${listing.id}`,
      title: listing.title,
      detail: `${humanize(listing.type)} · ${listing.district}`,
      timestamp: listing.createdAt,
      href: "/admin/listings",
      label: humanize(listing.status),
      icon: LayoutList,
    })),
    ...bookings.map((booking) => ({
      id: `booking-${booking.id}`,
      title: booking.listingTitle,
      detail: `${booking.renterName} → ${booking.ownerName}`,
      timestamp: booking.createdAt,
      href: "/admin/bookings",
      label: humanize(booking.status),
      icon: CalendarCheck,
    })),
  ];

  return activity
    .sort((left, right) => right.timestamp.localeCompare(left.timestamp))
    .slice(0, 6);
}

function formatNumber(value?: number) {
  return value === undefined ? "—" : new Intl.NumberFormat("en").format(value);
}


function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}

function humanize(value: string) {
  return value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}
