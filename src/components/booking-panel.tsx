"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Info, ShieldCheck, X } from "lucide-react";
import { formatNpr } from "@/lib/format";
import { bookingsApi } from "@/lib/api/bookings";
import { ApiError } from "@/lib/api/client";
import { priceUnitLabel, type ListingDetail } from "@/lib/api/listings";
import { useAuth } from "./auth-provider";
import { useToast } from "./toast-provider";

// Local calendar date (not UTC): in Nepal (UTC+5:45) a UTC date would roll the
// "tomorrow" default/min back to today for evening visitors.
function isoDate(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function BookingPanel({ listing }: { listing: ListingDetail }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const [start, setStart] = useState(isoDate(1));
  const [end, setEnd] = useState(isoDate(3));
  const [startTime, setStartTime] = useState("10:00");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const isService = listing.type === "SERVICE";
  const unit = priceUnitLabel(listing.priceUnit);
  const duration = useMemo(() => isService || listing.priceUnit === "FLAT" ? 1 : Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000) + 1), [end, isService, listing.priceUnit, start]);
  const rental = listing.pricePerUnit * duration;

  // Move focus into the sheet on open and close it on Escape.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function loginRedirect() {
    router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
  }

  function openSheet() {
    // While the session is still loading, open optimistically; submit re-checks.
    if (!loading && !user) return loginRedirect();
    setOpen(true);
  }

  async function submit() {
    if (!user) return loginRedirect();
    setSubmitting(true); setError("");
    try {
      const booking = await bookingsApi.create({ listingId: listing.id, startDate: start, endDate: isService ? start : end, startTime: isService ? startTime : undefined, note: note.trim() || undefined });
      showToast("Booking request sent to the owner.", { tone: "success" });
      router.push(`/bookings/${booking.id}?requested=1`);
    } catch (caught) {
      const message = caught instanceof ApiError ? caught.message : "We could not send your booking request.";
      setError(message);
      showToast(message, { tone: "error" });
      setSubmitting(false);
    }
  }

  return <>
    <aside className="booking-panel card"><p className="booking-panel__price"><strong>{formatNpr(listing.pricePerUnit)}</strong> / {unit}</p><div className="booking-panel__deposit"><ShieldCheck size={17} /><span><small>Refundable security deposit</small><strong>{formatNpr(listing.depositAmount)}</strong></span></div><button className="button button--wide" onClick={openSheet}>{isService ? "Check availability" : "Request booking"}</button><p className="booking-panel__fine">The owner reviews your dates before any deposit is due.</p></aside>
    <div className="mobile-booking-bar"><p><strong>{formatNpr(listing.pricePerUnit)}</strong><small> / {unit}</small></p><button className="button" onClick={openSheet}>Request booking</button></div>
    {open && <div className="sheet-backdrop" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && setOpen(false)}><section className="booking-sheet" role="dialog" aria-modal="true" aria-labelledby="booking-sheet-title"><header><div><p className="eyebrow">Booking request</p><h2 id="booking-sheet-title">Choose your {isService ? "date" : "dates"}</h2></div><button ref={closeRef} className="icon-button" aria-label="Close" onClick={() => setOpen(false)}><X /></button></header><div className="booking-sheet__body"><div className="form-grid form-grid--two"><div className="field"><label htmlFor="start-date">{isService ? "Service date" : "Start date"}</label><input id="start-date" type="date" min={isoDate(1)} value={start} onChange={(event) => setStart(event.target.value)} /></div>{!isService && <div className="field"><label htmlFor="end-date">Return date</label><input id="end-date" type="date" min={start} value={end} onChange={(event) => setEnd(event.target.value)} /></div>}</div>{isService && <div className="field"><label htmlFor="event-time">Preferred start time</label><input id="event-time" type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} /></div>}<div className="field"><label htmlFor="booking-note">Note for {listing.owner.fullName.split(" ")[0]} <span className="muted">(optional)</span></label><textarea id="booking-note" maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Share handover or service details." /></div><div className="price-breakdown card"><div><span>{formatNpr(listing.pricePerUnit)} × {duration}</span><strong>{formatNpr(rental)}</strong></div><div className="price-breakdown__total"><span>Estimated rental total</span><strong>{formatNpr(rental)}</strong></div><div className="price-breakdown__deposit"><span>Refundable deposit after approval</span><strong>{formatNpr(listing.depositAmount)}</strong></div></div><div className="form-note"><Info size={18} /><span>The owner approves first. If a deposit is required, attach proof to the booking after paying the owner directly.</span></div>{error && <p className="form-error" role="alert">{error}</p>}</div><footer><button className="button button--secondary" onClick={() => setOpen(false)}>Not yet</button><button className="button" disabled={submitting || !start || (!isService && (!end || end < start))} onClick={submit}>{submitting ? "Sending request…" : "Send booking request"}</button></footer></section></div>}
  </>;
}
