"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Info, ShieldCheck, X } from "lucide-react";
import { formatNpr, type Listing } from "@/lib/data";

function isoDate(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

export function BookingPanel({ listing }: { listing: Listing }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState(isoDate(1));
  const [end, setEnd] = useState(isoDate(3));
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const duration = useMemo(() => {
    if (listing.unit === "event") return 1;
    return Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000));
  }, [end, listing.unit, start]);
  const rental = listing.price * duration;
  const serviceFee = Math.round(rental * .08);

  function submit() {
    setSubmitting(true);
    const bookingId = listing.type === "Service" ? "RNT-9103" : "RNT-9102";
    window.setTimeout(() => router.push(`/bookings/${bookingId}?requested=1`), 700);
  }

  return (
    <>
      <aside className="booking-panel card">
        <p className="booking-panel__price"><strong>{formatNpr(listing.price)}</strong> / {listing.unit}</p>
        <div className="booking-panel__deposit"><ShieldCheck size={17} /><span><small>Refundable security deposit</small><strong>{formatNpr(listing.deposit)}</strong></span></div>
        <button className="button button--wide" onClick={() => setOpen(true)}>{listing.type === "Service" ? "Check availability" : "Request booking"}</button>
        <p className="booking-panel__fine">You will not be charged in Rentle. Payment happens directly after approval.</p>
      </aside>

      <div className="mobile-booking-bar">
        <p><strong>{formatNpr(listing.price)}</strong><small> / {listing.unit}</small></p>
        <button className="button" onClick={() => setOpen(true)}>Request booking</button>
      </div>

      {open && (
        <div className="sheet-backdrop" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && setOpen(false)}>
          <section className="booking-sheet" role="dialog" aria-modal="true" aria-labelledby="booking-sheet-title">
            <header><div><p className="eyebrow">Booking request</p><h2 id="booking-sheet-title">Choose your {listing.type === "Service" ? "date" : "dates"}</h2></div><button className="icon-button" aria-label="Close" onClick={() => setOpen(false)}><X /></button></header>
            <div className="booking-sheet__body">
              <div className="form-grid form-grid--two">
                <div className="field"><label htmlFor="start-date">{listing.type === "Service" ? "Event date" : "Start date"}</label><input id="start-date" type="date" min={isoDate(1)} value={start} onChange={(event) => setStart(event.target.value)} /></div>
                {listing.type === "Product" && <div className="field"><label htmlFor="end-date">Return date</label><input id="end-date" type="date" min={start} value={end} onChange={(event) => setEnd(event.target.value)} /></div>}
              </div>
              {listing.type === "Service" && <div className="field"><label htmlFor="event-time">Preferred start time</label><select id="event-time" defaultValue="10:00"><option>08:00</option><option value="10:00">10:00</option><option>14:00</option><option>16:00</option></select></div>}
              <div className="field"><label htmlFor="booking-note">Note for {listing.owner.split(" ")[0]} <span className="muted">(optional)</span></label><textarea id="booking-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Tell them when and where you plan to use it." /></div>
              <div className="price-breakdown card">
                <div><span>{formatNpr(listing.price)} × {duration} {listing.unit}{duration > 1 ? "s" : ""}</span><strong>{formatNpr(rental)}</strong></div>
                <div><span>Rentle service fee</span><strong>{formatNpr(serviceFee)}</strong></div>
                <div className="price-breakdown__total"><span>Total rental cost</span><strong>{formatNpr(rental + serviceFee)}</strong></div>
                <div className="price-breakdown__deposit"><span>Refundable deposit paid directly after approval</span><strong>{formatNpr(listing.deposit)}</strong></div>
              </div>
              <div className="form-note"><Info size={18} /><span>The owner approves first. Then you send the deposit by eSewa or Khalti and upload proof. Rentle keeps the agreement on record.</span></div>
            </div>
            <footer><button className="button button--secondary" onClick={() => setOpen(false)}>Not yet</button><button className="button" disabled={submitting} onClick={submit}>{submitting ? "Sending request…" : "Send booking request"}</button></footer>
          </section>
        </div>
      )}
      {submitting && <div className="toast"><CheckCircle2 size={19} /><span>Sending your request. Your dates and note are saved.</span></div>}
    </>
  );
}
