"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, Clock3, LogIn } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { bookingsApi, type Booking } from "@/lib/api/bookings";
import styles from "./bookings.module.css";

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
        // Open on the side that needs attention: owner requests waiting, or when there's
        // nothing being rented but requests are coming in.
        const pendingOwner = owner.content.some((b) => b.status === "REQUESTED");
        if ((pendingOwner && !renter.content.some((b) => b.status === "REQUESTED")) || (!renter.content.length && owner.content.length)) {
          setTab("hosting");
        }
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

  return <main className="page"><div className={`container bookings-page ${styles.page}`}>
    <header className={styles.header}><div><p className="eyebrow">Your activity</p><h1>Bookings</h1></div><p>Requests, deposit proof, and messages stay attached to each agreement.</p></header>

    {!authLoading && !user ? (
      <section className={`${styles.workspace} ${styles.gate}`}><span className={styles.icon}><LogIn size={22} /></span><div><p className="eyebrow">Account required</p><h2>Log in to access your bookings</h2><p>Your rental requests and owner bookings are private.</p></div><Link className="button" href="/login?next=/bookings">Log in</Link><p className={styles.secondary}>New to Rentle? <Link href="/register">Create an account</Link></p></section>
    ) : (
      <section className={styles.workspace}>
        <div className={styles.tabs} role="tablist" aria-label="Booking views"><button type="button" role="tab" id="renting-tab" aria-controls="bookings-panel" aria-selected={tab === "renting"} className={tab === "renting" ? styles.active : ""} onClick={() => setTab("renting")}>Renting <span>{loading ? "–" : renting.length}</span></button><button type="button" role="tab" id="hosting-tab" aria-controls="bookings-panel" aria-selected={tab === "hosting"} className={tab === "hosting" ? styles.active : ""} onClick={() => setTab("hosting")}>Owner requests <span>{loading ? "–" : hosting.length}</span></button></div>
        <div className={styles.content} id="bookings-panel" role="tabpanel" aria-labelledby={`${tab}-tab`}>
          {loading ? <div className="booking-list" aria-label="Loading bookings">{[1, 2].map((item) => <div className="skeleton" key={item} />)}</div>
            : error ? <EmptyState title="Bookings are temporarily unavailable" description={error} action={<button className="button" onClick={() => window.location.reload()}>Try again</button>} />
            : bookings.length ? <div className="booking-list">{bookings.map((booking) => <BookingCard booking={booking} tab={tab} key={booking.id} />)}</div>
            : tab === "renting" ? <EmptyState title="Nothing booked yet" description="Find something useful nearby — your requests will appear here." action={<Link className="button" href="/explore">Browse listings</Link>} />
            : <EmptyState title="No owner requests yet" description="New requests will appear here when someone books your listing." action={<Link className="button" href="/listings/manage">Manage listings</Link>} />}
        </div>
      </section>
    )}
  </div></main>;
}

function EmptyState({ title, description, action }: { title: string; description: string; action: React.ReactNode }) {
  return <div className={styles.empty}><span className={styles.icon}><CalendarDays size={22} /></span><div><h2>{title}</h2><p>{description}</p></div>{action}</div>;
}

function BookingCard({ booking, tab }: { booking: Booking; tab: "renting" | "hosting" }) {
  return <article className="booking-card card"><div className="booking-card__main"><div className="booking-card__top"><span className={statusClass(booking.status)}><Clock3 size={13} />{humanize(booking.status)}</span><small>#{booking.id.slice(0, 8)}</small></div><h2>{booking.listingTitle}</h2><p><CalendarDays size={15} /> {formatDates(booking)} · {tab === "renting" ? `owned by ${booking.ownerName}` : `requested by ${booking.renterName}`}</p><Link className="booking-card__action" href={`/bookings/${booking.id}`}>{actionLabel(booking, tab)}<ArrowRight size={16} /></Link></div></article>;
}

function actionLabel(booking: Booking, tab: "renting" | "hosting") { if (booking.status === "REQUESTED") return tab === "hosting" ? "Review request" : "View request"; if (booking.status === "APPROVED") return tab === "renting" ? "Upload deposit proof" : "View booking"; if (booking.status === "DEPOSIT_PENDING") return tab === "hosting" ? "Confirm deposit" : "View proof status"; if (booking.status === "COMPLETED") return "Leave or view review"; return "View booking"; }
function formatDates(booking: Booking) { const format = (value: string) => new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`)); return booking.startDate === booking.endDate ? format(booking.startDate) : `${format(booking.startDate)} – ${format(booking.endDate)}`; }
function humanize(value: string) { return value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase()); }
function statusClass(status: Booking["status"]) { return status === "ACTIVE" || status === "COMPLETED" ? "status-chip status-chip--verified" : "status-chip status-chip--requested"; }
