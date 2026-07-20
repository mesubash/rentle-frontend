"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Info, ShieldCheck, X } from "lucide-react";
import { formatNpr } from "@/lib/format";
import { bookingsApi, type Booking } from "@/lib/api/bookings";
import { ApiError } from "@/lib/api/client";
import { listingsApi, priceUnitLabel, type BlockedRange, type ListingDetail } from "@/lib/api/listings";
import { templatesApi, type FieldDefinition } from "@/lib/api/templates";
import { DynamicFields } from "./dynamic-fields";
import { useAuth } from "./auth-provider";
import { useToast } from "./toast-provider";

const EMPTY_BLOCKED_RANGES: BlockedRange[] = [];

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
  const [endTime, setEndTime] = useState("12:00");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [availability, setAvailability] = useState<{ listingId: string; blocked: BlockedRange[]; error: string } | null>(null);
  const [bookingFields, setBookingFields] = useState<FieldDefinition[]>([]);
  const [attrValues, setAttrValues] = useState<Record<string, unknown>>({});
  const [ownerBookings, setOwnerBookings] = useState<Booking[] | null>(null);
  const [ownerBookingsError, setOwnerBookingsError] = useState(false);
  const isService = listing.type === "SERVICE";
  const isOwner = user?.id === listing.owner.id;
  const isHourly = listing.priceUnit === "PER_HOUR";
  const unit = priceUnitLabel(listing.priceUnit);
  const availabilityLoading = availability?.listingId !== listing.id;
  const blockedRanges = availability?.listingId === listing.id ? availability.blocked : EMPTY_BLOCKED_RANGES;
  const availabilityError = availability?.listingId === listing.id ? availability.error : "";
  const rentalDays = useMemo(() => {
    if (isService || !start || !end || end < start) return 0;
    return Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000) + 1;
  }, [end, isService, start]);
  // Mirrors backend PricingService: hourly = whole hours between times (min 1),
  // daily = inclusive day count, flat = 1 unit.
  const duration = useMemo(() => {
    if (listing.priceUnit === "FLAT") return 1;
    if (isHourly) {
      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = endTime.split(":").map(Number);
      return Math.max(1, Math.floor((eh * 60 + em - (sh * 60 + sm)) / 60));
    }
    return Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000) + 1);
  }, [end, endTime, isHourly, listing.priceUnit, start, startTime]);
  const rental = listing.pricePerUnit * duration;
  const timesInvalid = isHourly && endTime <= startTime;
  const datesOverlap = useMemo(() => {
    const selectedEnd = isService ? start : end;
    if (!start || !selectedEnd || selectedEnd < start) return false;
    return blockedRanges.some((range) => start <= range.endDate && selectedEnd >= range.startDate);
  }, [blockedRanges, end, isService, start]);
  const dateValidationError = useMemo(() => {
    if (datesOverlap) return "Some of those dates are already booked — pick different dates";
    if (!isService && rentalDays) {
      const minDays = listing.product?.minRentalDays;
      const maxDays = listing.product?.maxRentalDays;
      if (minDays && rentalDays < minDays) return `This item has a minimum rental of ${minDays} ${minDays === 1 ? "day" : "days"}`;
      if (maxDays && rentalDays > maxDays) return `This item has a maximum rental of ${maxDays} ${maxDays === 1 ? "day" : "days"}`;
    }
    return "";
  }, [datesOverlap, isService, listing.product, rentalDays]);
  const listingBookings = useMemo(() => (ownerBookings ?? []).filter((booking) => booking.listingId === listing.id), [listing.id, ownerBookings]);
  const currentRental = listingBookings.find((booking) => booking.status === "ACTIVE") ?? null;
  const pendingBookings = listingBookings.filter((booking) => booking.status === "REQUESTED").sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const upcomingBooking = listingBookings
    .filter((booking) => ["APPROVED", "DEPOSIT_PENDING"].includes(booking.status) && booking.endDate >= isoDate(0))
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0] ?? null;
  const priorityBooking = currentRental ?? pendingBookings[0] ?? upcomingBooking;

  useEffect(() => {
    let active = true;
    listingsApi.availability(listing.id)
      .then((availability) => {
        if (active) setAvailability({ listingId: listing.id, blocked: availability.blocked, error: "" });
      })
      .catch(() => {
        if (active) setAvailability({ listingId: listing.id, blocked: [], error: "Availability could not be checked right now." });
      });
    return () => { active = false; };
  }, [listing.id]);

  // Load this category's BOOKING field template (docs/12) to collect extra request details.
  useEffect(() => {
    let active = true;
    templatesApi.current(listing.categoryId, "BOOKING")
      .then((tpl) => { if (active) setBookingFields(tpl?.fields ?? []); })
      .catch(() => { if (active) setBookingFields([]); });
    return () => { active = false; };
  }, [listing.categoryId]);

  useEffect(() => {
    if (!isOwner) return;
    let active = true;
    bookingsApi.asOwner(0, 100)
      .then((page) => { if (active) { setOwnerBookings(page.content); setOwnerBookingsError(false); } })
      .catch(() => { if (active) { setOwnerBookings([]); setOwnerBookingsError(true); } });
    return () => { active = false; };
  }, [isOwner]);

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
    if (isOwner) {
      router.push(ownerBookingsError ? "/bookings" : priorityBooking ? `/bookings/${priorityBooking.id}` : `/listings/manage/${listing.id}`);
      return;
    }
    if (!user) {
      if (loading) return;
      return loginRedirect();
    }
    if (user.status !== "VERIFIED") return router.push("/verification");
    setOpen(true);
  }

  async function submit() {
    if (!user) return loginRedirect();
    if (user.status !== "VERIFIED") {
      setOpen(false);
      router.push("/verification");
      return;
    }
    if (dateValidationError || availabilityLoading || !start || (!isService && (!end || end < start)) || timesInvalid) {
      if (dateValidationError) setError(dateValidationError);
      return;
    }
    setSubmitting(true); setError("");
    try {
      const booking = await bookingsApi.create({ listingId: listing.id, startDate: start, endDate: isService ? start : end, startTime: isHourly || isService ? startTime : undefined, endTime: isHourly ? endTime : undefined, note: note.trim() || undefined, attributes: bookingFields.length ? attrValues : undefined });
      showToast("Booking request sent to the owner.", { tone: "success" });
      router.push(`/bookings/${booking.id}?requested=1`);
    } catch (caught) {
      const message = caught instanceof ApiError ? caught.message : "We could not send your booking request.";
      setError(message);
      showToast(message, { tone: "error" });
      setSubmitting(false);
    }
  }

  const ownerActionLabel = ownerBookingsError ? "Open owner bookings" : currentRental ? "Manage current booking" : pendingBookings.length ? "Review booking request" : upcomingBooking ? "View upcoming booking" : "Manage listing";

  return <>
    <aside className="booking-panel"><p className="booking-panel__price"><strong>{formatNpr(listing.pricePerUnit)}</strong> / {unit}</p>{isOwner ? <>
      {ownerBookings === null ? <div className="owner-rental-status is-loading" aria-label="Loading rental status"><span /><span /><span /></div>
        : ownerBookingsError ? <div className="owner-rental-status"><small>Rental status</small><strong>Could not load booking details</strong><p>Open bookings to check the current handover.</p></div>
        : currentRental ? <div className="owner-rental-status"><small>Currently rented</small><strong className="owner-rental-status__person">{currentRental.renterName}</strong><p>{formatBookingPeriod(currentRental)} · {formatBookingDuration(currentRental)}</p><dl><div><dt>Started</dt><dd>{formatShortDate(currentRental.startDate)}</dd></div><div><dt>Return</dt><dd>{returnTiming(currentRental.endDate)}</dd></div></dl></div>
        : <div className="owner-rental-status"><small>Current rental</small><strong>Not currently rented</strong>{upcomingBooking && <p className="owner-rental-status__next">Next: {upcomingBooking.renterName}<br /><span>{formatBookingPeriod(upcomingBooking)} · {formatBookingDuration(upcomingBooking)}</span></p>}</div>}
      <button className="button button--wide" onClick={openSheet}>{ownerActionLabel}</button>
      {priorityBooking && <button type="button" className="owner-panel-link" onClick={() => router.push(`/listings/manage/${listing.id}`)}>Manage listing details</button>}
      {pendingBookings.length > 0 && <p className="booking-panel__fine">{pendingBookings.length} pending booking request{pendingBookings.length === 1 ? "" : "s"}</p>}
    </> : <><div className="booking-panel__deposit"><ShieldCheck size={17} /><span><small>Refundable security deposit</small><strong>{formatNpr(listing.depositAmount)}</strong></span></div><button className="button button--wide" onClick={openSheet}>{isService ? "Check availability" : "Request booking"}</button><p className="booking-panel__fine">The owner reviews your dates before any deposit is due.</p></>}</aside>
    <div className="mobile-booking-bar"><p>{isOwner && currentRental ? <><strong>{currentRental.renterName}</strong><small>{returnTiming(currentRental.endDate)}</small></> : <><strong>{formatNpr(listing.pricePerUnit)}</strong><small> / {unit}</small></>}</p><button className="button" onClick={openSheet}>{isOwner ? (ownerBookingsError ? "Open bookings" : currentRental ? "Manage booking" : pendingBookings.length ? "Review request" : upcomingBooking ? "View booking" : "Manage listing") : isService ? "Check date" : "Request booking"}</button></div>
    {open && !isOwner && <div className="sheet-backdrop" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && setOpen(false)}><section className="booking-sheet" role="dialog" aria-modal="true" aria-labelledby="booking-sheet-title"><header><div><p className="eyebrow">Booking request</p><h2 id="booking-sheet-title">Choose your {isService ? "date" : "dates"}</h2></div><button ref={closeRef} className="icon-button" aria-label="Close" onClick={() => setOpen(false)}><X /></button></header><div className="booking-sheet__body"><div className="form-grid form-grid--two"><div className="field"><label htmlFor="start-date">{isService ? "Service date" : "Start date"}</label><input id="start-date" type="date" min={isoDate(1)} value={start} onChange={(event) => { setStart(event.target.value); setError(""); }} /></div>{!isService && <div className="field"><label htmlFor="end-date">Return date</label><input id="end-date" type="date" min={start} value={end} onChange={(event) => { setEnd(event.target.value); setError(""); }} /></div>}</div>{dateValidationError && <p className="form-error" role="alert">{dateValidationError}</p>}{blockedRanges.length > 0 && <small className="form-note"><Info size={16} /><span>Some dates are unavailable because they are booked or blocked by the owner.</span></small>}{availabilityError && <p className="form-error" role="alert">{availabilityError}</p>}{isService && <div className="form-grid form-grid--two"><div className="field"><label htmlFor="event-time">Start time</label><input id="event-time" type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} /></div>{isHourly && <div className="field"><label htmlFor="event-end-time">End time</label><input id="event-end-time" type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} />{timesInvalid && <small className="form-error">End time must be after start time</small>}</div>}</div>}<div className="field"><label htmlFor="booking-note">Note for {listing.owner.fullName.split(" ")[0]} <span className="muted">(optional)</span></label><textarea id="booking-note" maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Share handover or service details." /></div><DynamicFields fields={bookingFields} values={attrValues} onChange={(key, value) => setAttrValues((current) => ({ ...current, [key]: value }))} idPrefix="booking-attr" /><div className="price-breakdown card"><div><span>{formatNpr(listing.pricePerUnit)} × {duration}</span><strong>{formatNpr(rental)}</strong></div><div className="price-breakdown__total"><span>Estimated rental total</span><strong>{formatNpr(rental)}</strong></div><div className="price-breakdown__deposit"><span>Refundable deposit after approval</span><strong>{formatNpr(listing.depositAmount)}</strong></div></div><div className="form-note"><Info size={18} /><span>The owner approves first. If a deposit is required, attach proof to the booking after paying the owner directly.</span></div>{error && error !== dateValidationError && <p className="form-error" role="alert">{error}</p>}</div><footer><button className="button button--secondary" onClick={() => setOpen(false)}>Not yet</button><button className="button" disabled={submitting || availabilityLoading || !!dateValidationError || !start || timesInvalid || (!isService && (!end || end < start))} onClick={submit}>{submitting ? "Sending request…" : "Send booking request"}</button></footer></section></div>}
  </>;
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short" }).format(parseLocalDate(value));
}

function formatBookingPeriod(booking: Booking) {
  if (booking.startDate === booking.endDate) return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(parseLocalDate(booking.startDate));
  const start = formatShortDate(booking.startDate);
  const end = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(parseLocalDate(booking.endDate));
  return `${start} – ${end}`;
}

function formatBookingDuration(booking: Booking) {
  if (booking.startTime && booking.endTime && booking.startDate === booking.endDate) {
    const [startHour, startMinute] = booking.startTime.split(":").map(Number);
    const [endHour, endMinute] = booking.endTime.split(":").map(Number);
    const hours = Math.max(1, Math.ceil((endHour * 60 + endMinute - startHour * 60 - startMinute) / 60));
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  }
  const days = Math.max(1, Math.round((parseLocalDate(booking.endDate).getTime() - parseLocalDate(booking.startDate).getTime()) / 86_400_000) + 1);
  return `${days} ${days === 1 ? "day" : "days"}`;
}

function returnTiming(value: string) {
  const days = Math.round((parseLocalDate(value).getTime() - parseLocalDate(isoDate(0)).getTime()) / 86_400_000);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}
