"use client";

import { useEffect, useState } from "react";
import { providerVerificationApi, type ProviderVerification } from "@/lib/api/provider-verification";
import { ApiError } from "@/lib/api/client";
import { P } from "@/lib/iam/permission-keys";
import { useCan } from "./can";
import { AdminCount, AdminEmptyState, AdminPageHeader, AdminTableShell } from "./admin-ui";
import { useToast } from "./toast-provider";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

function messageOf(caught: unknown, fallback: string) {
  return caught instanceof ApiError ? caught.message : fallback;
}

export function AdminProviderVerificationsView() {
  const canReview = useCan(P.KYC_SUBMISSION_APPROVE);
  const { showToast } = useToast();
  const [rows, setRows] = useState<ProviderVerification[]>([]);
  const [status, setStatus] = useState<"SUBMITTED" | "APPROVED" | "REJECTED">("SUBMITTED");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acting, setActing] = useState("");

  useEffect(() => {
    let active = true;
    providerVerificationApi.adminQueue(status)
      .then((page) => { if (active) { setRows(page.content); setError(""); } })
      .catch((caught) => { if (active) setError(messageOf(caught, "Could not load submissions.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [status]);

  async function decide(v: ProviderVerification, approve: boolean) {
    const reason = approve ? undefined : (window.prompt("Rejection reason:") ?? "Credentials could not be verified");
    setActing(v.id);
    try {
      if (approve) await providerVerificationApi.approve(v.id);
      else await providerVerificationApi.reject(v.id, reason!);
      setRows((cur) => cur.filter((r) => r.id !== v.id));
      showToast(approve ? "Approved." : "Rejected.", { tone: "success" });
    } catch (caught) {
      showToast(messageOf(caught, "Could not update."), { tone: "error" });
    } finally { setActing(""); }
  }

  return (
    <div className="admin-scope space-y-6">
      <AdminPageHeader title="Provider verifications" description="Credentials submitted by service providers per category. Approve to let them list." />
      <div className="flex flex-wrap gap-2">
        {(["SUBMITTED", "APPROVED", "REJECTED"] as const).map((s) => (
          <Button key={s} size="sm" variant={status === s ? "default" : "outline"} onClick={() => setStatus(s)}>{s}</Button>
        ))}
      </div>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      <AdminTableShell>
        <div className="flex items-center justify-between px-4 py-3"><AdminCount>{rows.length} submissions</AdminCount></div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Submitted fields</TableHead>
                <TableHead>Status</TableHead>
                {canReview && status === "SUBMITTED" && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && Array.from({ length: 3 }).map((_, i) => <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-6 w-full" /></TableCell></TableRow>)}
              {!loading && rows.length === 0 && <TableRow><TableCell colSpan={5}><AdminEmptyState title="Nothing here" description="No submissions in this view." /></TableCell></TableRow>}
              {!loading && rows.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-mono text-xs">{v.userId.slice(0, 8)}</TableCell>
                  <TableCell className="font-mono text-xs">{v.categoryId.slice(0, 8)}</TableCell>
                  <TableCell className="max-w-sm text-sm">{Object.entries(v.fields).map(([k, val]) => `${k}: ${String(val)}`).join("; ") || "—"}</TableCell>
                  <TableCell><Badge variant={v.status === "SUBMITTED" ? "default" : "secondary"}>{v.status}</Badge></TableCell>
                  {canReview && status === "SUBMITTED" && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" disabled={acting === v.id} onClick={() => decide(v, false)}>Reject</Button>
                        <Button size="sm" disabled={acting === v.id} onClick={() => decide(v, true)}>Approve</Button>
                      </div>
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
