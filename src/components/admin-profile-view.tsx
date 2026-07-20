"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, CheckCircle2, Edit3, KeyRound, Mail, Phone, ShieldCheck } from "lucide-react";
import { assetUrl } from "@/lib/api/assets";
import { AdminPageHeader, AdminStatus } from "./admin-ui";
import { useAuth } from "./auth-provider";
import { usePermissions } from "./permissions-provider";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export function AdminProfileView() {
  const { user, loading } = useAuth();
  const { permissions } = usePermissions();

  if (loading || !user) return <div className="space-y-5"><Skeleton className="h-20" /><Skeleton className="h-80" /></div>;
  const photo = assetUrl(user.profilePhotoUrl);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Profile"
        description="Your staff identity, account verification, and resolved administrative access."
        actions={<Button asChild variant="outline"><Link href="/profile/edit"><Edit3 /> Edit profile</Link></Button>}
      />

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,.65fr)]">
        <Card>
          <CardHeader className="border-b">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-primary text-xl font-bold text-primary-foreground">
                {photo ? <Image src={photo} alt={user.fullName} fill sizes="80px" className="object-cover" /> : initials(user.fullName)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-xl">{user.fullName}</CardTitle>
                  <AdminStatus value={user.status} />
                </div>
                <CardDescription className="mt-1">{user.email}</CardDescription>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="secondary">{user.authProvider} account</Badge>
                  {user.citizenshipVerified && <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700"><ShieldCheck /> Identity verified</Badge>}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5 pt-6 sm:grid-cols-2">
            <ProfileField icon={Mail} label="Email" value={user.email} verified={user.emailVerified} />
            <ProfileField icon={Phone} label="Phone" value={user.phoneNumber ?? "Not added"} verified={Boolean(user.phoneNumber && user.phoneVerified)} />
            <ProfileField icon={CalendarDays} label="Member since" value={formatDate(user.createdAt)} />
            <ProfileField icon={ShieldCheck} label="KYC status" value={user.citizenshipVerified ? "Verified" : user.kycStatus ? humanize(user.kycStatus) : "Not submitted"} verified={user.citizenshipVerified} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><KeyRound className="size-4" /> Administrative access</CardTitle>
              <CardDescription>Permissions resolved from your live role assignments.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tracking-tight">{permissions.size}</p>
              <p className="mt-1 text-sm text-muted-foreground">active permissions</p>
              <Button asChild variant="outline" className="mt-4 w-full"><Link href="/admin/roles">Review roles</Link></Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trust score</CardTitle>
              <CardDescription>Your current marketplace trust indicator.</CardDescription>
            </CardHeader>
            <CardContent>
              {user.trustScore > 0
                ? <div className="flex items-end gap-2"><strong className="text-3xl">{user.trustScore.toFixed(1)}</strong><span className="pb-1 text-sm text-muted-foreground">/ 5</span></div>
                : <p className="text-sm font-medium text-muted-foreground">No reviews yet</p>}
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, ((user.trustScore ?? 0) / 5) * 100))}%` }} /></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ icon: Icon, label, value, verified }: { icon: typeof Mail; label: string; value: string; verified?: boolean }) {
  return (
    <div className="flex gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted"><Icon className="size-4 text-muted-foreground" /></span>
      <div className="min-w-0"><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm font-medium">{value}</p>{verified && <span className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-700"><CheckCircle2 className="size-3" /> Verified</span>}</div>
    </div>
  );
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date(value));
}

function humanize(value: string) {
  return value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}
