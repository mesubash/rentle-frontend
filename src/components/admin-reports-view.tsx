"use client";

import { useEffect, useState } from "react";
import { reportsApi, type Report, type ReportStatus } from "@/lib/api/reports";
import { ApiError } from "@/lib/api/client";
import { P } from "@/lib/iam/permission-keys";
import { useCan } from "./can";
import { AdminCount, AdminEmptyState, AdminPageHeader, AdminTableShell } from "./admin-ui";
import { useToast } from "./toast-provider";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

const FILTERS: { label: string; value: ReportStatus | "" }[] = [
  { label: "Open", value: "OPEN" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Dismissed", value: "DISMISSED" },
  { label: "All", value: "" },
];

function targetHref(report: Report): string {
  if (report.targetType === "LISTING") return `/listing/${report.targetId}`;
  if (report.targetType === "USER") return `/profile/${report.targetId}`;
  return `/admin/bookings/${report.targetId}`;
}

function messageOf(caught: unknown, fallback: string) {
  return caught instanceof ApiError ? caught.message : fallback;
}

export function AdminReportsView() {
  const canResolve = useCan(P.TRUST_REPORT_RESOLVE);
  const { showToast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<ReportStatus | "">("OPEN");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acting, setActing] = useState("");

  useEffect(() => {
    let active = true;
    reportsApi.adminList(filter || undefined)
      .then((page) => { if (active) { setReports(page.content); setError(""); } })
      .catch((caught) => { if (active) setError(messageOf(caught, "Reports could not be loaded.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filter]);

  async function handle(report: Report, status: "RESOLVED" | "DISMISSED") {
    const note = window.prompt(`Add a note for this ${status.toLowerCase()} action (optional):`) ?? undefined;
    setActing(report.id);
    try {
      await reportsApi.resolve(report.id, status, note);
      setReports((current) => current.filter((r) => r.id !== report.id || filter === ""));
      if (filter === "") {
        setReports((current) => current.map((r) => (r.id === report.id ? { ...r, status } : r)));
      }
      showToast(`Report ${status.toLowerCase()}.`, { tone: "success" });
    } catch (caught) {
      showToast(messageOf(caught, "Could not update the report."), { tone: "error" });
    } finally {
      setActing("");
    }
  }

  return (
    <div className="admin-scope space-y-6">
      <AdminPageHeader
        title="Reports"
        description="Trust & safety reports raised by users. Review each and resolve or dismiss with a note."
      />
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.label}
            size="sm"
            variant={filter === f.value ? "default" : "outline"}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      <AdminTableShell>
        <div className="flex items-center justify-between px-4 py-3">
          <AdminCount>{reports.length} reports</AdminCount>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Target</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Status</TableHead>
                {canResolve && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={canResolve ? 5 : 4}><Skeleton className="h-6 w-full" /></TableCell>
                  </TableRow>
                ))}
              {!loading && reports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={canResolve ? 5 : 4}>
                    <AdminEmptyState title="No reports" description="Nothing to review in this view." />
                  </TableCell>
                </TableRow>
              )}
              {!loading && reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <a className="font-medium underline underline-offset-2" href={targetHref(report)}>
                      {report.targetType}
                    </a>
                  </TableCell>
                  <TableCell className="max-w-sm whitespace-pre-wrap">{report.reason}</TableCell>
                  <TableCell>{report.reporterName}</TableCell>
                  <TableCell>
                    <Badge variant={report.status === "OPEN" ? "default" : "secondary"}>{report.status}</Badge>
                  </TableCell>
                  {canResolve && (
                    <TableCell className="text-right">
                      {report.status === "OPEN" ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" disabled={acting === report.id} onClick={() => handle(report, "DISMISSED")}>Dismiss</Button>
                          <Button size="sm" disabled={acting === report.id} onClick={() => handle(report, "RESOLVED")}>Resolve</Button>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Handled</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AdminTableShell>
    </div>
  );
}
