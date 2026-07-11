"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Info,
  ShieldCheck,
} from "lucide-react";
import { type ChangeEvent, useEffect, useState } from "react";
import { useAuth } from "./auth-provider";
import { ReviewForm } from "./review-form";
import { StatusTimeline } from "./status-timeline";
import { assetUrl } from "@/lib/api/assets";
import { bookingsApi, type Booking } from "@/lib/api/bookings";
import { ApiError } from "@/lib/api/client";
import { formatNpr } from "@/lib/data";

export function BookingDetailView({ bookingId }: { bookingId: string }) {
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);
  const [reason, setReason] = useState("");
  const [proof, setProof] = useState<File | null>(null);
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
  async function act(action: () => Promise<Booking>) {
    setActing(true);
    setError("");
    try {
      setBooking(await action());
      setReason("");
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "The booking could not be updated.",
      );
    } finally {
      setActing(false);
    }
  }
  function chooseProof(event: ChangeEvent<HTMLInputElement>) {
    setProof(event.target.files?.[0] ?? null);
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
            <h1>{booking.listingTitle}</h1>
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
            <section className="card booking-action-card">
              <p className="eyebrow">Available actions</p>
              <h2>{actionHeading(booking, isOwner)}</h2>
              {booking.renterNote && (
                <div className="form-note">
                  <Info size={17} />
                  <span>Renter note: {booking.renterNote}</span>
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
              {booking.status === "APPROVED" &&
                !isOwner &&
                booking.depositAmount > 0 && (
                  <div className="form-grid">
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
                          "Upload after paying the owner directly."}
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
                      Upload proof
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
                      href={assetUrl(booking.depositProofUrl) || "#"}
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
            {booking.status === "COMPLETED" && <ReviewForm bookingId={booking.id} />}
            <section className="card booking-facts">
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
            <section className="card counterpart-card">
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
      </div>
    </main>
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
