"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, ClipboardCheck } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { KycAdminRow } from "@/lib/api/kyc";
import { AdminCount, AdminEmptyState, AdminPageHeader, AdminTableShell } from "./admin-ui";
import { Skeleton } from "./ui/skeleton";
import { initials } from "@/lib/format";

export function VerificationQueue() {
  const [rows, setRows] = useState<KycAdminRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.kycQueue()
      .then((page) => setRows(page.content))
      .catch((caught) => setError(caught instanceof ApiError ? caught.message : "The queue could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-scope space-y-6">
      <AdminPageHeader
        title="Verification queue"
        description="Review citizenship submissions and approve verified marketplace identities."
        actions={<AdminCount>{rows.length} pending</AdminCount>}
      />
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : rows.length === 0 ? (
        <AdminEmptyState icon={ClipboardCheck} title="The queue is clear" description="New identity submissions will appear here for review." />
      ) : (
        <AdminTableShell>
          <ul className="divide-y">
            {rows.map((row) => (
              <li key={row.userId}>
                <Link
                  href={`/admin/verifications/${row.userId}`}
                  prefetch
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold">{initials(row.realName)}</span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm">{row.realName}</strong>
                    <small className="block truncate text-xs text-muted-foreground">{row.email}</small>
                  </span>
                  <span className="hidden text-xs text-muted-foreground sm:inline">{formatDate(row.submittedAt)}</span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </AdminTableShell>
      )}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}
