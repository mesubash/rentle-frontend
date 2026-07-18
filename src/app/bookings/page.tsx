"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, Clock3, LogIn } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { bookingsApi, type Booking } from "@/lib/api/bookings";

export default function BookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<"renting" | "hosting">("renting");
  const [renting, setRenting] = useState<Booking[]>([]);
  const [hosting, setHosting] = useState<Booking[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    let active = true;
    Promise.all([bookingsApi.asRenter(0, 50), bookingsApi.asOwner(0, 50)])
      .then(([renter, owner]) => {
        if (!active) return;
        setRenting(renter.content);
        setHosting(owner.content);
      })
      .catch(() => {
        if (active) setError("We could not reach Rentle right now. Please try again shortly.");
      })
      .finally(() => {
        if (active) setDataLoading(false);
      });
    return () => { active = false; };
  }, [user]);

  const bookings = tab === "renting" ? renting : hosting;
  const loading = authLoading || Boolean(user && dataLoading);

  return <main className="page"><div className="container bookings-page">
    <header className="page-header"><p className="eyebrow">Your activity</p><h1>Bookings</h1><p>Requests, deposit proof, and messages stay attached to each agreement.</p></header>

    {!authLoading && !user ? (
      <section className="empty-state card access-gate"><LogIn size={30} /><p className="eyebrow">Account required</p><h2>Log in to access your bookings</h2><p>Your rental requests and owner bookings are private. Log in to view and manage them.</p><Link className="button" href="/login?next=/bookings">Log in to Rentle</Link><p className="access-gate__secondary">New to Rentle? <Link href="/register">Create an account</Link></p></section>
    ) : loading ? (
      <div className="booking-list" aria-label="Loading bookings">{[1, 2, 3].map((item) => <div className="skeleton" key={item} />)}</div>
    ) : (
      <>
        <div className="tabs" role="tablist"><button role="tab" aria-selected={tab === "renting"} className={tab === "renting" ? "is-active" : ""} onClick={() => setTab("renting")}>Renting <span>{renting.length}</span></button><button role="tab" aria-selected={tab === "hosting"} className={tab === "hosting" ? "is-active" : ""} onClick={() => setTab("hosting")}>Owner requests <span>{hosting.length}</span></button></div>
        {error ? <section className="empty-state card"><h2>Bookings are temporarily unavailable</h2><p>{error}</p><button className="button" onClick={() => window.location.reload()}>Try again</button></section> : bookings.length ? <div className="booking-list">{bookings.map((booking) => <BookingCard booking={booking} tab={tab} key={booking.id} />)}</div> : (tab === "renting"
          ? <section className="empty-state card"><CalendarDays size={26} /><h2>Nothing booked yet</h2><p>Find a camera, an outfit, or a local pro nearby — your requests show up here.</p><Link className="button" href="/explore">Browse listings</Link></section>
          : <section className="empty-state card"><CalendarDays size={26} /><h2>No requests yet</h2><p>When someone requests one of your listings, it lands here for you to approve.</p><Link className="button" href="/listings/manage">Manage your listings</Link></section>)}
      </>
    )}
  </div></main>;
}

function BookingCard({ booking, tab }: { booking: Booking; tab: "renting" | "hosting" }) {
  return <article className="booking-card card"><div className="booking-card__main"><div className="booking-card__top"><span className={statusClass(booking.status)}><Clock3 size={13} />{humanize(booking.status)}</span><small>#{booking.id.slice(0, 8)}</small></div><h2>{booking.listingTitle}</h2><p><CalendarDays size={15} /> {formatDates(booking)} · {tab === "renting" ? `owned by ${booking.ownerName}` : `requested by ${booking.renterName}`}</p><Link className="booking-card__action" href={`/bookings/${booking.id}`}>{actionLabel(booking, tab)}<ArrowRight size={16} /></Link></div></article>;
}

function actionLabel(booking: Booking, tab: "renting" | "hosting") { if (booking.status === "REQUESTED") return tab === "hosting" ? "Review request" : "View request"; if (booking.status === "APPROVED") return tab === "renting" ? "Upload deposit proof" : "View booking"; if (booking.status === "DEPOSIT_PENDING") return tab === "hosting" ? "Confirm deposit" : "View proof status"; if (booking.status === "COMPLETED") return "Leave or view review"; return "View booking"; }
function formatDates(booking: Booking) { const format = (value: string) => new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`)); return booking.startDate === booking.endDate ? format(booking.startDate) : `${format(booking.startDate)} – ${format(booking.endDate)}`; }
function humanize(value: string) { return value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase()); }
function statusClass(status: Booking["status"]) { return status === "ACTIVE" || status === "COMPLETED" ? "status-chip status-chip--verified" : "status-chip status-chip--requested"; }
