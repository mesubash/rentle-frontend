"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, ChevronRight, X } from "lucide-react";
import { adminApi, citizenshipImageUrl } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { Kyc, KycAdminRow } from "@/lib/api/kyc";

export function VerificationQueue() {
  const [rows, setRows] = useState<KycAdminRow[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState<Kyc | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    adminApi
      .kycQueue()
      .then((page) => {
        setRows(page.content);
        setSelectedId(page.content[0]?.userId || "");
      })
      .catch((caught) => setError(caught instanceof ApiError ? caught.message : "The queue could not be loaded."));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    adminApi
      .kycDetail(selectedId)
      .then((k) => active && setDetail(k))
      .catch(() => active && setError("Could not load this submission."));
    return () => {
      active = false;
    };
  }, [selectedId]);

  function select(userId: string) {
    setSelectedId(userId);
    setDetail(null);
    setRejecting(false);
    setReason("");
  }

  const selected = rows.find((r) => r.userId === selectedId) || rows[0];

  function removeSelected(message: string) {
    const remaining = rows.filter((r) => r.userId !== selectedId);
    setRows(remaining);
    setSelectedId(remaining[0]?.userId || "");
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
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
    <>
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Trust operations</p>
          <h1>KYC review queue</h1>
          <p>Check each submission against the citizenship images. Approving replaces the account name with the verified legal name.</p>
        </div>
        <span className="queue-count">{rows.length} pending</span>
      </header>

      {error && <p className="form-error" role="alert">{error}</p>}

      {selected ? (
        <div className="admin-queue-layout">
          <section className="admin-table card">
            <div className="admin-table__head"><span>Applicant</span><span>Submitted</span><span /></div>
            {rows.map((row) => (
              <button
                key={row.userId}
                className={selected.userId === row.userId ? "admin-row is-selected" : "admin-row"}
                onClick={() => select(row.userId)}
              >
                <span><strong>{row.realName}</strong><small>{row.email}</small></span>
                <span>{formatDate(row.submittedAt)}</span>
                <ChevronRight size={17} />
              </button>
            ))}
          </section>

          <aside className="review-panel card">
            {detail ? (
              <>
                <header>
                  <div>
                    <p className="eyebrow">Account #{selected.userId.slice(0, 8)}</p>
                    <h2>{detail.realName}</h2>
                    <p>{selected.email}</p>
                  </div>
                  <span className="status-chip status-chip--requested">Pending</span>
                </header>

                <div className="kyc-docs">
                  {(["front", "back"] as const).map((side) => (
                    <figure key={side}>
                      <Image
                        src={citizenshipImageUrl(selected.userId, side)}
                        alt={`Citizenship ${side}`}
                        width={320}
                        height={200}
                        unoptimized
                      />
                      <figcaption>{side === "front" ? "Front" : "Back"}</figcaption>
                    </figure>
                  ))}
                </div>

                {selected.currentName !== detail.realName && (
                  <p className="form-note">
                    Signup name &ldquo;{selected.currentName}&rdquo; will be replaced with &ldquo;{detail.realName}&rdquo;.
                  </p>
                )}

                <dl className="kyc-review-fields">
                  <Row label="Father's name" value={detail.fatherName} />
                  <Row label="Grandfather's name" value={detail.grandfatherName} />
                  <Row label="Date of birth" value={detail.dateOfBirth} />
                  {detail.gender && <Row label="Gender" value={detail.gender} />}
                  <Row label="Citizenship no." value={detail.citizenshipNumber} />
                  <Row label="Issued in" value={detail.citizenshipIssueDistrict} />
                  <Row label="Occupation" value={detail.occupation} />
                  <Row label="Permanent" value={formatAddress(detail.permanentAddress)} />
                  <Row label="Temporary" value={formatAddress(detail.temporaryAddress)} />
                </dl>

                {rejecting ? (
                  <div className="form-grid">
                    <div className="field">
                      <label htmlFor="reject-reason">Reason for rejection</label>
                      <textarea id="reject-reason" maxLength={400} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Photos unclear; name does not match the card." />
                    </div>
                    <div className="split-actions">
                      <button className="button button--secondary" disabled={acting} onClick={() => setRejecting(false)}>Back</button>
                      <button className="button button--danger" disabled={acting || !reason.trim()} onClick={reject}>
                        <X size={16} /> {acting ? "Rejecting…" : "Confirm rejection"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="review-panel__actions split-actions">
                    <button className="button button--danger" disabled={acting} onClick={() => setRejecting(true)}>Reject</button>
                    <button className="button" disabled={acting} onClick={approve}>
                      <Check size={17} /> {acting ? "Approving…" : "Approve & verify"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="message-date">Loading submission…</p>
            )}
          </aside>
        </div>
      ) : (
        !error && (
          <section className="empty-state card">
            <p className="eyebrow">Queue clear</p>
            <h2>No KYC submissions are waiting.</h2>
            <p>New submissions will appear here for review.</p>
          </section>
        )
      )}

      {notice && <div className="toast"><Check size={18} />{notice}</div>}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div><dt>{label}</dt><dd>{value}</dd></div>;
}

function formatAddress(a: Kyc["permanentAddress"]) {
  return [a.tole, `${a.municipality}-${a.ward}`, a.district].filter(Boolean).join(", ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}
