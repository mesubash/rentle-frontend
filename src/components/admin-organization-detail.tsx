"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Building2 } from "lucide-react";
import { adminApi, type AdminOrgDetail } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import { AdminTableShell } from "./admin-ui";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

export function AdminOrganizationDetail({ id }: { id: string }) {
  const [org, setOrg] = useState<AdminOrgDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    adminApi.org(id)
      .then((detail) => { if (active) setOrg(detail); })
      .catch((caught) => { if (active) setError(caught instanceof ApiError ? caught.message : "This organization could not be loaded."); });
    return () => { active = false; };
  }, [id]);

  return (
    <div className="admin-scope space-y-4">
      <Link href="/admin/organizations" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> Organizations
      </Link>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

      {!org && !error ? (
        <Card><CardContent className="space-y-4 pt-6"><Skeleton className="h-16" /><Skeleton className="h-48" /></CardContent></Card>
      ) : org ? (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4 border-b">
            <div>
              <CardDescription className="flex items-center gap-1"><Building2 className="size-3.5" /> /{org.slug}</CardDescription>
              <CardTitle className="mt-1 text-xl">{org.name}</CardTitle>
              {org.bio && <p className="mt-1 max-w-prose text-sm text-muted-foreground">{org.bio}</p>}
            </div>
            <div className="flex gap-2 text-center">
              <Stat label="Members" value={org.members.length} />
              <Stat label="Listings" value={org.listingCount} />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <h3 className="mb-3 text-sm! font-semibold">Members</h3>
            <AdminTableShell>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Person</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {org.members.map((m) => (
                    <TableRow key={m.userId}>
                      <TableCell><strong>{m.fullName}</strong></TableCell>
                      <TableCell className="text-muted-foreground">{m.email}</TableCell>
                      <TableCell><Badge variant="secondary">{m.roleDisplayName}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AdminTableShell>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-md border px-4 py-2"><div className="text-lg font-semibold">{value}</div><div className="text-xs text-muted-foreground">{label}</div></div>;
}
