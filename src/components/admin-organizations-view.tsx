"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { adminApi, type AdminOrgRow } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import { AdminCount, AdminEmptyState, AdminPageHeader, AdminToolbar, AdminTableShell } from "./admin-ui";
import { AdminTableRowLink } from "./admin-table-row-link";
import { Skeleton } from "./ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

export function AdminOrganizationsView() {
  const [rows, setRows] = useState<AdminOrgRow[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const id = window.setTimeout(() => {
      adminApi.orgs(search || undefined, 0, 50)
        .then((page) => { if (active) { setRows(page.content); setTotal(page.totalElements); } })
        .catch((caught) => { if (active) setError(caught instanceof ApiError ? caught.message : "Organizations could not be loaded."); })
        .finally(() => { if (active) setLoading(false); });
    }, search ? 250 : 0);
    return () => { active = false; window.clearTimeout(id); };
  }, [search]);

  return (
    <div className="admin-scope space-y-6">
      <AdminPageHeader
        title="Organizations"
        description="Every registered organization on Rentle — members, listings and when they joined."
        actions={<AdminCount>{total} total</AdminCount>}
      />
      <AdminToolbar value={search} onChange={setSearch} placeholder="Search organizations…" />
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : rows.length === 0 ? (
        <AdminEmptyState icon={Building2} title={search ? "No matches" : "No organizations yet"} description={search ? "Try a different name." : "Organizations created by users will appear here."} />
      ) : (
        <AdminTableShell>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Listings</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((org) => (
                <AdminTableRowLink key={org.id} href={`/admin/organizations/${org.id}`} label={`Open ${org.name}`}>
                  <TableCell><strong className="block">{org.name}</strong><span className="block text-xs text-muted-foreground">/{org.slug} · #{org.id.slice(0, 8)}</span></TableCell>
                  <TableCell>{org.memberCount}</TableCell>
                  <TableCell>{org.listingCount}</TableCell>
                  <TableCell>{formatDate(org.createdAt)}</TableCell>
                </AdminTableRowLink>
              ))}
            </TableBody>
          </Table>
        </AdminTableShell>
      )}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}
