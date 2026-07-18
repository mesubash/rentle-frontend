"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { Booking } from "@/lib/api/bookings";
import { P } from "@/lib/iam/permission-keys";
import { formatNpr } from "@/lib/format";
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

export function AdminFeesView() {
  const canManage = useCan(P.BOOKING_FEE_MANAGE);
  const { showToast } = useToast();
  const [rows, setRows] = useState<Booking[]>([]);
  const [invoiced, setInvoiced] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acting, setActing] = useState("");

  useEffect(() => {
    let active = true;
    adminApi.fees(invoiced)
      .then((page) => { if (active) { setRows(page.content); setError(""); } })
      .catch((caught) => { if (active) setError(messageOf(caught, "Fees could not be loaded.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [invoiced]);

  const total = rows.reduce((sum, b) => sum + (b.platformFeeAmount ?? 0), 0);

  async function markInvoiced(b: Booking) {
    setActing(b.id);
    try {
      await adminApi.markFeeInvoiced(b.id);
      setRows((current) => current.filter((r) => r.id !== b.id));
      showToast("Fee marked invoiced.", { tone: "success" });
    } catch (caught) {
      showToast(messageOf(caught, "Could not update the fee."), { tone: "error" });
    } finally {
      setActing("");
    }
  }

  return (
    <div className="admin-scope space-y-6">
      <AdminPageHeader title="Platform fees" description="Commission on completed bookings, for manual monthly invoicing." />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={!invoiced ? "default" : "outline"} onClick={() => setInvoiced(false)}>Uninvoiced</Button>
        <Button size="sm" variant={invoiced ? "default" : "outline"} onClick={() => setInvoiced(true)}>Invoiced</Button>
      </div>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      <AdminTableShell>
        <div className="flex items-center justify-between px-4 py-3">
          <AdminCount>{rows.length} bookings</AdminCount>
          {!invoiced && <span className="text-sm font-medium">Uninvoiced total: {formatNpr(total)}</span>}
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Listing</TableHead>
                <TableHead>Parties</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Status</TableHead>
                {canManage && !invoiced && <TableHead className="text-right">Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-6 w-full" /></TableCell></TableRow>
                ))}
              {!loading && rows.length === 0 && (
                <TableRow><TableCell colSpan={6}><AdminEmptyState title="Nothing here" description="No bookings in this view." /></TableCell></TableRow>
              )}
              {!loading && rows.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.listingTitle}</TableCell>
                  <TableCell>{b.ownerName} → {b.renterName}</TableCell>
                  <TableCell>{formatNpr(b.totalPrice)}</TableCell>
                  <TableCell>{formatNpr(b.platformFeeAmount ?? 0)}</TableCell>
                  <TableCell><Badge variant={b.feeInvoiced ? "secondary" : "default"}>{b.feeInvoiced ? "Invoiced" : "Due"}</Badge></TableCell>
                  {canManage && !invoiced && (
                    <TableCell className="text-right">
                      <Button size="sm" disabled={acting === b.id} onClick={() => markInvoiced(b)}>
                        {acting === b.id ? "…" : "Mark invoiced"}
                      </Button>
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
