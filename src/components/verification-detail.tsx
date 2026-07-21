"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, X } from "lucide-react";
import { adminApi, citizenshipImageUrl } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { Kyc } from "@/lib/api/kyc";
import { P } from "@/lib/iam/permission-keys";
import { AdminStatus } from "./admin-ui";
import { Can } from "./can";
import { useToast } from "./toast-provider";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { VerificationDetailSkeleton } from "./verification-detail-skeleton";

export function VerificationDetail({ userId }: { userId: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [detail, setDetail] = useState<Kyc | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    let active = true;
    adminApi.kycDetail(userId)
      .then((kyc) => { if (active) setDetail(kyc); })
      .catch((caught) => { if (active) setError(caught instanceof ApiError ? caught.message : "Could not load this submission."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId]);

  async function approve() {
    setActing(true);
    try {
      await adminApi.approveKyc(userId);
      adminApi.invalidateKycQueue();
      showToast(`${detail?.realName ?? "Applicant"} was verified.`, { tone: "success" });
      router.push("/admin/verifications");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not approve.");
      setActing(false);
    }
  }

  async function reject() {
    if (!reason.trim()) return;
    setActing(true);
    try {
      await adminApi.rejectKyc(userId, reason.trim());
      adminApi.invalidateKycQueue();
      showToast(`${detail?.realName ?? "Applicant"}'s submission was rejected.`, { tone: "success" });
      router.push("/admin/verifications");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not reject.");
      setActing(false);
    }
  }

  if (loading) return <VerificationDetailSkeleton />;

  return (
    <div className="admin-scope space-y-4">
      <Link href="/admin/verifications" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> Back to queue
      </Link>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

      {!detail ? null : (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4 border-b">
            <div>
              <CardDescription>Account #{userId.slice(0, 8)}</CardDescription>
              <CardTitle className="mt-1 text-xl">{detail.realName}</CardTitle>
            </div>
            <AdminStatus value="PENDING" />
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <section>
              <h3 className="mb-3 text-sm! font-semibold">Citizenship documents</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {(["front", "back"] as const).map((side) => (
                  <figure className="overflow-hidden rounded-md border bg-muted" key={side}>
                    <Image className="aspect-[8/5] w-full object-cover" src={citizenshipImageUrl(userId, side)} alt={`Citizenship ${side}`} width={640} height={400} unoptimized />
                    <figcaption className="border-t bg-card px-3 py-2 text-xs font-medium capitalize">{side} side</figcaption>
                  </figure>
                ))}
              </div>
            </section>

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
        </Card>
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
