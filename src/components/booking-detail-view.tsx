"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Image as ImageIcon,
  Info,
  ShieldCheck,
  WalletCards,
  X,
} from "lucide-react";
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./auth-provider";
import { ReportButton } from "./report-button";
import { ReviewForm } from "./review-form";
import { StatusTimeline } from "./status-timeline";
import { useToast } from "./toast-provider";
import {
  bookingsApi,
  type Booking,
  type BookingConditionPhase,
} from "@/lib/api/bookings";
import { ApiError } from "@/lib/api/client";
import { assetUrl } from "@/lib/api/assets";
import { listingsApi } from "@/lib/api/listings";
import { reviewsApi } from "@/lib/api/reviews";
import { formatNpr } from "@/lib/format";

export function BookingDetailView({ bookingId }: { bookingId: string }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);
  const [reason, setReason] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [reviewed, setReviewed] = useState<boolean | null>(null);
  const [reviewStatusError, setReviewStatusError] = useState("");
  const [workers, setWorkers] = useState<import("@/lib/api/workers").Worker[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  useEffect(() => {
    bookingsApi
      .detail(bookingId)
      .then(setBooking)
      .catch((caught) =>
        setError(
          caught instanceof ApiError
            ? caught.message
            : "This booking could not be loaded.",
        ),
      );
  }, [bookingId]);
  useEffect(() => {
    if (user?.accountType !== "BUSINESS" || user?.id !== booking?.ownerId) return;
    let active = true;
    import("@/lib/api/workers").then(({ workersApi }) => workersApi.list())
      .then((list) => { if (active) setWorkers(list.filter((w) => w.active)); })
      .catch(() => undefined);
    return () => { active = false; };
  }, [user?.accountType, user?.id, booking?.ownerId]);
  useEffect(() => {
    const listingId = booking?.listingId;
    if (!listingId) return;
    let active = true;
    listingsApi
      .detail(listingId)
      .then((listing) => { if (active) setCoverImage(assetUrl(listing.coverImage)); })
      .catch(() => undefined);
    return () => { active = false; };
  }, [booking?.listingId]);
  useEffect(() => {
    if (booking?.status !== "COMPLETED") return;
    let active = true;
    reviewsApi
      .myReviewStatus(booking.id)
      .then((status) => {
        if (!active) return;
        setReviewed(status);
        setReviewStatusError("");
      })
      .catch(() => {
        if (active) setReviewStatusError("Your review status could not be loaded.");
      });
    return () => {
      active = false;
    };
  }, [booking?.id, booking?.status]);
  if (!booking)
    return (
      <main className="page">
        <div className="container narrow-page">
          <p>{error || "Loading booking…"}</p>
        </div>
      </main>
    );
  const isOwner = user?.id === booking.ownerId;
  const counterpart = isOwner ? booking.renterName : booking.ownerName;
  const canAssignWorker = isOwner && user?.accountType === "BUSINESS"
    && ["APPROVED", "DEPOSIT_PENDING", "ACTIVE"].includes(booking.status);
  const reviewSubjectName = user?.id === booking.ownerId
    ? booking.renterName
    : user?.id === booking.renterId
      ? booking.ownerName
      : "the other participant";
  async function act(action: () => Promise<Booking>) {
    setActing(true);
    setError("");
    try {
      const updated = await action();
      setBooking(updated);
      setReason("");
      showToast(`Booking updated: ${humanize(updated.status)}.`, { tone: "success" });
    } catch (caught) {
      const message = caught instanceof ApiError ? caught.message : "The booking could not be updated.";
      setError(message);
      showToast(message, { tone: "error" });
    } finally {
      setActing(false);
    }
  }
  function chooseProof(event: ChangeEvent<HTMLInputElement>) {
    setProof(event.target.files?.[0] ?? null);
  }
  async function recordCondition(
    phase: BookingConditionPhase,
    file: File,
    note?: string,
  ) {
    const updated = await bookingsApi.recordCondition(
      bookingId,
      phase,
      file,
      note,
    );
    setBooking(updated);
    const refreshed = await bookingsApi.detail(bookingId);
    setBooking(refreshed);
    showToast(
      phase === "CHECKOUT"
        ? "Hand-over condition saved."
        : "Return condition saved.",
      { tone: "success" },
    );
  }
  const terminal =
    booking.status === "COMPLETED" ||
    booking.status === "CANCELLED" ||
    booking.status === "REJECTED";

  return (
    <main className="page">
      <div className="container booking-detail">
        <Link className="back-link" href="/bookings">
          <ArrowLeft size={16} /> Back to bookings
        </Link>
        <header className="booking-detail__header">
          <div>
            <p className="eyebrow">Booking #{booking.id.slice(0, 8)}</p>
            <h1>
              <Link href={`/listing/${booking.listingId}`}>
                {booking.listingTitle}
              </Link>
            </h1>
            <p>
              {formatDates(booking)} · with {counterpart}
            </p>
          </div>
          <span
            className={
              booking.status === "ACTIVE" || booking.status === "COMPLETED"
                ? "status-chip status-chip--verified"
                : "status-chip status-chip--requested"
            }
          >
            {humanize(booking.status)}
          </span>
        </header>
        <section className="card timeline-card">
          <div className="timeline-scroll">
            <StatusTimeline status={booking.status} />
          </div>
          <div className="timeline-note">
            <Info size={17} />
            <span>{statusNote(booking, isOwner, counterpart)}</span>
          </div>
        </section>
        <div className="booking-detail__grid">
          <div className="booking-detail__primary">
            <section className="booking-section">
              <h2>{actionHeading(booking, isOwner)}</h2>
              {booking.renterNote && (
                <div className="form-note">
                  <Info size={17} />
                  <span>Renter note: {booking.renterNote}</span>
                </div>
              )}
              {canAssignWorker && (
                <div className="field">
                  <label htmlFor="assign-worker">Assign a worker to attend</label>
                  <select
                    id="assign-worker"
                    value={booking.assignedWorkerId ?? ""}
                    onChange={(event) => act(() => bookingsApi.assignWorker(booking.id, event.target.value || undefined))}
                  >
                    <option value="">No one assigned yet</option>
                    {workers.map((w) => <option key={w.id} value={w.id}>{w.name}{w.role ? ` — ${w.role}` : ""}</option>)}
                  </select>
                  {workers.length === 0 && <small>Add workers on the <Link href="/workers">Workers</Link> page first.</small>}
                </div>
              )}
              {!isOwner && booking.assignedWorkerName && (
                <div className="form-note">
                  <Info size={17} />
                  <span>{booking.assignedWorkerName} will attend this booking.</span>
                </div>
              )}
              {booking.status === "REQUESTED" && isOwner && (
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="decision-reason">
                      Reason if declining (optional)
                    </label>
                    <textarea
                      id="decision-reason"
                      maxLength={500}
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                    />
                  </div>
                  <div className="split-actions">
                    <button
                      className="button button--danger"
                      disabled={acting}
                      onClick={() =>
                        act(() =>
                          bookingsApi.reject(booking.id, reason || undefined),
                        )
                      }
                    >
                      Decline
                    </button>
                    <button
                      className="button"
                      disabled={acting}
                      onClick={() => act(() => bookingsApi.approve(booking.id))}
                    >
                      Approve dates
                    </button>
                  </div>
                </div>
              )}
              {(booking.status === "APPROVED" ||
                booking.status === "DEPOSIT_PENDING") &&
                !isOwner &&
                booking.depositAmount > 0 && (
                  <div className="form-grid">
                    <div className="form-note">
                      <WalletCards size={19} />
                      {booking.ownerPaymentWallet ? (
                        <span><strong>Send the deposit to:</strong> {booking.ownerPaymentWallet}</span>
                      ) : (
                        <span>The owner has not added a payment wallet. Ask for payment details in <Link href={`/messages/${booking.id}`}>booking messages</Link> before sending money.</span>
                      )}
                    </div>
                    <div className="field">
                      <label htmlFor="deposit-proof">
                        Deposit payment proof
                      </label>
                      <input
                        id="deposit-proof"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={chooseProof}
                      />
                      <small>
                        {proof?.name ||
                          (booking.status === "DEPOSIT_PENDING"
                            ? "Owner is reviewing your proof. Re-upload if you need to correct it."
                            : "Upload after paying the owner directly.")}
                      </small>
                    </div>
                    <button
                      className="button"
                      disabled={!proof || acting}
                      onClick={() =>
                        proof &&
                        act(() => bookingsApi.uploadDeposit(booking.id, proof))
                      }
                    >
                      {booking.status === "DEPOSIT_PENDING"
                        ? "Re-upload proof"
                        : "Upload proof"}
                    </button>
                  </div>
                )}
              {booking.status === "APPROVED" &&
                isOwner &&
                booking.depositAmount === 0 && (
                  <button
                    className="button"
                    disabled={acting}
                    onClick={() =>
                      act(() => bookingsApi.confirmDeposit(booking.id))
                    }
                  >
                    Activate zero-deposit booking
                  </button>
                )}
              {booking.status === "DEPOSIT_PENDING" && isOwner && (
                <>
                  <p>
                    Check the payment in your own account before confirming. The
                    uploaded image alone is not proof of receipt.
                  </p>
                  {booking.depositProofUrl && (
                    <a
                      className="button button--secondary"
                      href={`/api/rentle/bookings/${booking.id}/deposit-proof`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open uploaded proof
                    </a>
                  )}
                  <button
                    className="button"
                    disabled={acting}
                    onClick={() =>
                      act(() => bookingsApi.confirmDeposit(booking.id))
                    }
                  >
                    Confirm deposit received
                  </button>
                </>
              )}
              {booking.status === "ACTIVE" && (
                <button
                  className="button"
                  disabled={acting}
                  onClick={() => act(() => bookingsApi.complete(booking.id))}
                >
                  Mark booking complete
                </button>
              )}
              {!terminal && !(booking.status === "REQUESTED" && isOwner) && (
                <details className="disclosure">
                  <summary>Cancel this booking</summary>
                  <div className="form-grid">
                    <div className="field">
                      <label htmlFor="cancel-reason">
                        Cancellation reason (optional)
                      </label>
                      <textarea
                        id="cancel-reason"
                        maxLength={500}
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                      />
                    </div>
                    <button
                      className="button button--danger"
                      disabled={acting}
                      onClick={() =>
                        act(() =>
                          bookingsApi.cancel(booking.id, reason || undefined),
                        )
                      }
                    >
                      Cancel booking
                    </button>
                  </div>
                </details>
              )}
              {terminal && (
                <p>
                  {booking.cancellationReason ||
                    (booking.status === "COMPLETED"
                      ? "The booking is complete. You can now leave a verified review."
                      : "This booking is closed.")}
                </p>
              )}
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
            </section>
            {(booking.status === "ACTIVE" ||
              booking.status === "COMPLETED") && (
              <section className="booking-section">
                <h2>Condition &amp; handover</h2>
                <p>
                  Either participant can record the item condition. This helps
                  protect both sides if there is a deposit dispute.
                </p>
                {booking.agreedTerms && (
                  <div className="field">
                    <label>Agreed terms</label>
                    <div className="form-note">
                      <span
                        style={{
                          minWidth: 0,
                          overflowWrap: "anywhere",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {booking.agreedTerms}
                      </span>
                    </div>
                  </div>
                )}
                <ConditionCapture
                  bookingId={booking.id}
                  phase="CHECKOUT"
                  title="Item condition at hand-over"
                  hasCondition={booking.hasCheckoutCondition}
                  savedNote={booking.checkoutNote}
                  onSave={recordCondition}
                />
                {(booking.hasCheckoutCondition || booking.hasReturnCondition) && (
                  <ConditionCapture
                    bookingId={booking.id}
                    phase="RETURN"
                    title="Item condition at return"
                    hasCondition={booking.hasReturnCondition}
                    savedNote={booking.returnNote}
                    onSave={recordCondition}
                    separated
                  />
                )}
              </section>
            )}
            {booking.status === "COMPLETED" && (
              reviewStatusError ? (
                <section className="booking-section">
                  <p className="form-error" role="alert">{reviewStatusError}</p>
                </section>
              ) : reviewed === null ? (
                <section className="booking-section"><p>Checking your review status…</p></section>
              ) : reviewed ? (
                <section className="booking-section">
                  <CheckCircle2 className="state-icon state-icon--success" size={30} />
                  <p className="eyebrow">Review complete</p>
                  <h2>You reviewed this booking</h2>
                  <p>Your verified review of {reviewSubjectName} is already published.</p>
                </section>
              ) : (
                <ReviewForm bookingId={booking.id} subjectName={reviewSubjectName} />
              )
            )}
            <section className="booking-section booking-facts">
              <h2>Booking details</h2>
              <dl>
                <div>
                  <dt>
                    <CalendarDays /> Dates
                  </dt>
                  <dd>{formatDates(booking)}</dd>
                </div>
                {booking.startTime && (
                  <div>
                    <dt>Start time</dt>
                    <dd>{booking.startTime}</dd>
                  </div>
                )}
                <div>
                  <dt>Rental total</dt>
                  <dd>{formatNpr(booking.totalPrice)}</dd>
                </div>
                <div>
                  <dt>Refundable deposit</dt>
                  <dd>{formatNpr(booking.depositAmount)}</dd>
                </div>
                <div>
                  <dt>Deposit confirmed</dt>
                  <dd>{booking.depositPaid ? "Yes" : "No"}</dd>
                </div>
              </dl>
            </section>
          </div>
          <aside className="booking-detail__aside">
            <Link className="listing-peek" href={`/listing/${booking.listingId}`}>
              <span className="listing-peek__image">
                {coverImage ? (
                  <Image src={coverImage} alt="" fill sizes="72px" unoptimized />
                ) : (
                  <ImageIcon size={18} aria-hidden="true" />
                )}
              </span>
              <span className="listing-peek__copy">
                <strong>{booking.listingTitle}</strong>
                <small>View listing</small>
              </span>
            </Link>
            <section className="counterpart-card">
              <span className="avatar avatar--large">
                {initials(counterpart)}
              </span>
              <div>
                <p className="eyebrow">{isOwner ? "Renter" : "Owner"}</p>
                <h2>{counterpart}</h2>
              </div>
              {booking.status !== "REQUESTED" && (
                <Link
                  className="button button--secondary button--wide"
                  href={`/messages/${booking.id}`}
                >
                  Open booking messages
                </Link>
              )}
            </section>
            <section className="deposit-guide">
              <ShieldCheck size={20} />
              <div>
                <strong>Deposit record</strong>
                <p>
                  Rentle records proof and confirmation but does not hold the
                  money.
                </p>
              </div>
            </section>
            {booking.status === "COMPLETED" && (
              <div className="inline-success">
                <CheckCircle2 size={18} />
                <span>This booking can now receive a verified review.</span>
              </div>
            )}
          </aside>
        </div>
        <div className="booking-report"><ReportButton targetType="BOOKING" targetId={booking.id} label="Report a problem with this booking" /></div>
      </div>
    </main>
  );
}

function ConditionCapture({
  bookingId,
  phase,
  title,
  hasCondition,
  savedNote,
  onSave,
  separated = false,
}: {
  bookingId: string;
  phase: BookingConditionPhase;
  title: string;
  hasCondition: boolean;
  savedNote: string | null;
  onSave: (
    phase: BookingConditionPhase,
    file: File,
    note?: string,
  ) => Promise<void>;
  separated?: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  function clearFile() {
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  const inputId = `condition-${bookingId}-${phase.toLowerCase()}`;
  const noteId = `${inputId}-note`;
  const imageUrl = `/api/rentle/bookings/${bookingId}/condition/${phase}`;

  async function saveCondition() {
    if (!file) return;
    setSaving(true);
    setError("");
    try {
      await onSave(phase, file, note.trim() || undefined);
      clearFile();
      setNote("");
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "The condition evidence could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="form-grid"
      style={
        separated
          ? {
              borderTop: "1px solid var(--border-soft)",
              marginTop: 20,
              minWidth: 0,
              paddingTop: 20,
            }
          : { marginTop: 20, minWidth: 0 }
      }
    >
      <h3 style={{ margin: 0 }}>{title}</h3>
      {hasCondition ? (
        <>
          <div className="field">
            <label>Recorded photo</label>
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open the full-size ${title.toLowerCase()} photo`}
              style={{
                display: "block",
                minWidth: 0,
                overflow: "hidden",
                borderRadius: "var(--radius)",
              }}
            >
              <Image
                src={imageUrl}
                alt={title}
                width={960}
                height={720}
                sizes="(max-width: 959px) calc(100vw - 68px), 600px"
                unoptimized
                style={{
                  display: "block",
                  height: "auto",
                  maxHeight: 420,
                  objectFit: "cover",
                  width: "100%",
                }}
              />
            </a>
            <small>Tap the photo to open it full size.</small>
          </div>
          {savedNote && (
            <div className="field">
              <label>Condition note</label>
              <div className="form-note">
                <span
                  style={{
                    minWidth: 0,
                    overflowWrap: "anywhere",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {savedNote}
                </span>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="field">
            <label htmlFor={inputId}>Condition photo</label>
            <input
              ref={fileRef}
              id={inputId}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              hidden={Boolean(file)}
            />
            {previewUrl && file ? (
              <div className="file-preview">
                <Image
                  className="file-preview__thumb"
                  src={previewUrl}
                  alt="Selected condition photo preview"
                  width={160}
                  height={160}
                  unoptimized
                />
                <div className="file-preview__meta">
                  <strong>{file.name}</strong>
                  <small>{Math.round(file.size / 1024)} KB</small>
                </div>
                <button
                  type="button"
                  className="file-preview__remove"
                  onClick={clearFile}
                  aria-label="Remove the selected photo"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <small>Choose a clear photo of the item condition.</small>
            )}
          </div>
          <div className="field">
            <label htmlFor={noteId}>Condition note (optional)</label>
            <textarea
              id={noteId}
              maxLength={500}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Add visible marks, wear, missing parts, or other details."
            />
          </div>
          <button
            className="button"
            type="button"
            style={{ justifySelf: "start" }}
            disabled={!file || saving}
            onClick={saveCondition}
          >
            {saving
              ? "Saving…"
              : phase === "CHECKOUT"
                ? "Save hand-over condition"
                : "Save return condition"}
          </button>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function formatDates(booking: Booking) {
  const f = (value: string) =>
    new Intl.DateTimeFormat("en", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(`${value}T00:00:00`));
  return booking.startDate === booking.endDate
    ? f(booking.startDate)
    : `${f(booking.startDate)} – ${f(booking.endDate)}`;
}
function humanize(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}
function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
function actionHeading(booking: Booking, owner: boolean) {
  if (booking.status === "REQUESTED")
    return owner ? "Review this request" : "Waiting for the owner";
  if (booking.status === "APPROVED")
    return owner
      ? booking.depositAmount
        ? "Waiting for deposit proof"
        : "Activate the booking"
      : booking.depositAmount
        ? "Attach deposit proof"
        : "Waiting for activation";
  if (booking.status === "DEPOSIT_PENDING")
    return owner ? "Confirm the deposit" : "Waiting for deposit confirmation";
  if (booking.status === "ACTIVE") return "Complete after handover";
  return humanize(booking.status);
}
function statusNote(booking: Booking, owner: boolean, counterpart: string) {
  if (booking.status === "REQUESTED")
    return owner
      ? `${counterpart} is waiting for your decision.`
      : `${counterpart} has not reviewed the request yet.`;
  if (booking.status === "APPROVED")
    return booking.depositAmount
      ? "The dates are approved. Deposit proof is the next step."
      : "The dates are approved and no deposit is required.";
  if (booking.status === "DEPOSIT_PENDING")
    return owner
      ? "Verify the transfer in your wallet before activating."
      : "The owner is checking your payment proof.";
  if (booking.status === "ACTIVE")
    return "Keep handover details in the booking messages.";
  return (
    booking.cancellationReason ||
    `This booking is ${humanize(booking.status).toLowerCase()}.`
  );
}
