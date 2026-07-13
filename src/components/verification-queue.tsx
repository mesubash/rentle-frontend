"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Check, ChevronRight, ClipboardCheck, X } from "lucide-react";
import { adminApi, citizenshipImageUrl } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { Kyc, KycAdminRow } from "@/lib/api/kyc";
import { P } from "@/lib/iam/permission-keys";
import { AdminCount, AdminEmptyState, AdminPageHeader, AdminStatus } from "./admin-ui";
import { Can } from "./can";
import { useToast } from "./toast-provider";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Skeleton } from "./ui/skeleton";
import { Textarea } from "./ui/textarea";
import { cn } from "@/lib/utils";

export function VerificationQueue() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<KycAdminRow[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState<Kyc | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [acting, setActing] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    adminApi.kycQueue()
      .then((page) => {
        setRows(page.content);
        setSelectedId(page.content[0]?.userId || "");
      })
      .catch((caught) => setError(caught instanceof ApiError ? caught.message : "The queue could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    adminApi.kycDetail(selectedId)
      .then((kyc) => active && setDetail(kyc))
      .catch(() => active && setError("Could not load this submission."))
      .finally(() => active && setDetailLoading(false));
    return () => { active = false; };
  }, [selectedId]);

  function select(userId: string) {
    setSelectedId(userId);
    setDetail(null);
    setDetailLoading(true);
    setRejecting(false);
    setReason("");
  }

  const selected = rows.find((row) => row.userId === selectedId) || rows[0];

  function removeSelected(message: string) {
    const remaining = rows.filter((row) => row.userId !== selectedId);
    setRows(remaining);
    setSelectedId(remaining[0]?.userId || "");
    setDetail(null);
    setDetailLoading(Boolean(remaining.length));
    showToast(message, { tone: "success" });
  }

  async function approve() {
    if (!selected) return;
    setActing(true);
    setError("");
    try {
      await adminApi.approveKyc(selected.userId);
      removeSelected(`${selected.realName} was verified.`);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not approve.");
    } finally {
      setActing(false);
    }
  }

  async function reject() {
    if (!selected || !reason.trim()) return;
    setActing(true);
    setError("");
    try {
      await adminApi.rejectKyc(selected.userId, reason.trim());
      removeSelected(`${selected.realName}'s submission was rejected.`);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not reject.");
    } finally {
      setActing(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Verification queue"
        description="Review citizenship submissions and approve verified marketplace identities."
        actions={<AdminCount>{rows.length} pending</AdminCount>}
      />

      {error && <p className="form-error" role="alert">{error}</p>}

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <Skeleton className="h-[30rem]" />
          <Skeleton className="h-[36rem]" />
        </div>
      ) : selected ? (
        <div className="grid items-start gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <Card className="overflow-hidden py-0 lg:sticky lg:top-20">
            <CardHeader className="border-b py-4">
              <CardTitle className="text-base">Applicants</CardTitle>
              <CardDescription>Oldest submissions first</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[calc(100svh-12rem)] overflow-y-auto p-2">
              {rows.map((row) => (
                <button
                  key={row.userId}
                  className={cn("flex w-full items-center gap-3 rounded-md px-3 py-3 text-left transition-colors hover:bg-muted", selected.userId === row.userId && "bg-muted")}
                  onClick={() => select(row.userId)}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold">{initials(row.realName)}</span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm">{row.realName}</strong>
                    <small className="block truncate text-xs text-muted-foreground">{row.email}</small>
                    <small className="mt-1 block text-xs text-muted-foreground">{formatDate(row.submittedAt)}</small>
                  </span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            {detailLoading || !detail ? (
              <CardContent className="space-y-4 pt-6"><Skeleton className="h-16" /><Skeleton className="h-72" /><Skeleton className="h-48" /></CardContent>
            ) : (
              <>
                <CardHeader className="flex flex-row items-start justify-between gap-4 border-b">
                  <div>
                    <CardDescription>Account #{selected.userId.slice(0, 8)}</CardDescription>
                    <CardTitle className="mt-1 text-xl">{detail.realName}</CardTitle>
                    <CardDescription className="mt-1">{selected.email}</CardDescription>
                  </div>
                  <AdminStatus value="PENDING" />
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <section>
                    <h3 className="mb-3 text-sm! font-semibold">Citizenship documents</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(["front", "back"] as const).map((side) => (
                        <figure className="overflow-hidden rounded-md border bg-muted" key={side}>
                          <Image className="aspect-[8/5] w-full object-cover" src={citizenshipImageUrl(selected.userId, side)} alt={`Citizenship ${side}`} width={640} height={400} unoptimized />
                          <figcaption className="border-t bg-card px-3 py-2 text-xs font-medium capitalize">{side} side</figcaption>
                        </figure>
                      ))}
                    </div>
                  </section>

                  {selected.currentName !== detail.realName && (
                    <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                      Signup name “{selected.currentName}” will be replaced with “{detail.realName}”.
                    </p>
                  )}

                  <section>
                    <h3 className="mb-3 text-sm! font-semibold">Identity details</h3>
                    <dl className="grid overflow-hidden rounded-md border sm:grid-cols-2">
                      <Row label="Father's name" value={detail.fatherName} />
                      <Row label="Grandfather's name" value={detail.grandfatherName} />
                      <Row label="Date of birth" value={detail.dateOfBirth} />
                      {detail.gender && <Row label="Gender" value={detail.gender} />}
                      <Row label="Citizenship no." value={detail.citizenshipNumber} />
                      <Row label="Issued in" value={detail.citizenshipIssueDistrict} />
                      <Row label="Occupation" value={detail.occupation} />
                      <Row label="Permanent address" value={formatAddress(detail.permanentAddress)} />
                      <Row label="Temporary address" value={formatAddress(detail.temporaryAddress)} />
                    </dl>
                  </section>

                  {rejecting ? (
                    <Can perm={P.KYC_SUBMISSION_REJECT}>
                      <div className="space-y-3 rounded-md border p-4">
                        <div className="space-y-2">
                          <Label htmlFor="reject-reason">Reason for rejection</Label>
                          <Textarea id="reject-reason" maxLength={400} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="For example: the photos are unclear or details do not match." />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" disabled={acting} onClick={() => setRejecting(false)}>Back</Button>
                          <Button variant="destructive" disabled={acting || !reason.trim()} onClick={reject}><X />{acting ? "Rejecting…" : "Confirm rejection"}</Button>
                        </div>
                      </div>
                    </Can>
                  ) : (
                    <div className="flex flex-wrap justify-end gap-2 border-t pt-5">
                      <Can perm={P.KYC_SUBMISSION_REJECT}><Button variant="outline" disabled={acting} onClick={() => setRejecting(true)}>Reject</Button></Can>
                      <Can perm={P.KYC_SUBMISSION_APPROVE}><Button disabled={acting} onClick={approve}><Check />{acting ? "Approving…" : "Approve identity"}</Button></Can>
                    </div>
                  )}
                </CardContent>
              </>
            )}
          </Card>
        </div>
      ) : (
        !error && <AdminEmptyState icon={ClipboardCheck} title="The queue is clear" description="New identity submissions will appear here for review." />
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="border-b p-3 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0 sm:odd:border-r"><dt className="text-xs font-medium text-muted-foreground">{label}</dt><dd className="mt-1 text-sm">{value}</dd></div>;
}

function formatAddress(address: Kyc["permanentAddress"]) {
  return [address.tole, `${address.municipality}-${address.ward}`, address.district].filter(Boolean).join(", ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}
