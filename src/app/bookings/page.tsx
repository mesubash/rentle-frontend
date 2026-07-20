"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, Clock3, Compass, ListPlus, UserRound } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useOrg } from "@/components/org-provider";
import { SiteFooter } from "@/components/site-footer";
import { bookingsApi, type Booking } from "@/lib/api/bookings";
import styles from "./bookings.module.css";

export default function BookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { activeOrgId } = useOrg();
  const [tab, setTab] = useState<"renting" | "hosting">("renting");
  const [renting, setRenting] = useState<Booking[]>([]);
  const [hosting, setHosting] = useState<Booking[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    let active = true;
    Promise.all([bookingsApi.asRenter(0, 50), bookingsApi.asOwner(0, 50, activeOrgId ?? undefined)])
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
  }, [user, activeOrgId]);

  const bookings = tab === "renting" ? renting : hosting;
  const loading = authLoading || Boolean(user && dataLoading);

  return <>
    <main className="page bookings-flow-page"><div className={`container bookings-page ${styles.page}`}>
    <header className={styles.header}>
      <div><p className="eyebrow">Your activity</p><h1>Bookings</h1><p>Track what you are renting and respond to requests for your listings.</p></div>
      <nav className={styles.shortcuts} aria-label="Booking shortcuts">
        <Link href="/explore"><Compass size={16} /> Find something</Link>
        {user && <Link href="/listings/manage"><ListPlus size={16} /> Manage listings</Link>}
      </nav>
    </header>

    {!authLoading && !user ? (
      <section className={styles.gate}><h2>Log in to view bookings</h2><p>Rental requests and booking details are private to your account.</p><Link className="button" href="/login?next=/bookings">Log in</Link><p className={styles.secondary}>New to Rentle? <Link href="/register">Create an account</Link></p></section>
    ) : (
      <section aria-label="Booking activity">
        <div className={styles.tabs} role="tablist" aria-label="Booking views"><button type="button" role="tab" id="renting-tab" aria-controls="bookings-panel" aria-selected={tab === "renting"} className={tab === "renting" ? styles.active : ""} onClick={() => setTab("renting")}>My rentals <span>{loading ? "" : renting.length}</span></button><button type="button" role="tab" id="hosting-tab" aria-controls="bookings-panel" aria-selected={tab === "hosting"} className={tab === "hosting" ? styles.active : ""} onClick={() => setTab("hosting")}>Requests for my listings <span>{loading ? "" : hosting.length}</span></button></div>
        <div className={styles.content} id="bookings-panel" role="tabpanel" aria-labelledby={`${tab}-tab`}>
          {loading ? <p className={styles.loading} role="status">Loading bookings…</p>
            : error ? <EmptyState title="Bookings are unavailable" description={error} action={<button className={styles.textAction} onClick={() => window.location.reload()}>Reload bookings</button>} />
            : bookings.length ? <div className={styles.list}>{bookings.map((booking) => <BookingCard booking={booking} tab={tab} key={booking.id} />)}</div>
            : tab === "renting" ? <EmptyState title="No rental requests yet" description="Bookings you request will appear here." action={<Link className={styles.textAction} href="/explore">Browse listings <ArrowRight size={15} /></Link>} />
            : <EmptyState title="No booking requests yet" description="Requests for your active listings will appear here." action={<Link className={styles.textAction} href="/listings/manage">Manage listings <ArrowRight size={15} /></Link>} />}
        </div>
      </section>
    )}
    </div></main>
    <SiteFooter prompt={{
      title: "Need help with a booking?",
      description: "Read the handover guidance or ask Rentle when something feels unclear.",
      href: "/support",
      label: "Get booking help",
    }} />
  </>;
}

function EmptyState({ title, description, action }: { title: string; description: string; action: React.ReactNode }) {
  return <div className={styles.empty}><h2>{title}</h2><p>{description}</p>{action}</div>;
}

function BookingCard({ booking, tab }: { booking: Booking; tab: "renting" | "hosting" }) {
  const marker = dateMarker(booking);
  return <article className={styles.bookingRow}>
    <time className={styles.dateMarker} dateTime={booking.startDate}><span>{marker.month}</span><strong>{marker.day}</strong><small>{marker.detail}</small></time>
    <div className={styles.bookingMain}>
      <div className={styles.bookingTop}><span className={statusClass(booking.status)}><Clock3 size={13} />{humanize(booking.status)}</span><small>Booking #{booking.id.slice(0, 8)}</small></div>
      <h2>{booking.listingTitle}</h2>
      <div className={styles.bookingMeta}><span><CalendarDays size={15} /> {formatDates(booking)}</span><span><UserRound size={15} /> {tab === "renting" ? `Owned by ${booking.ownerName}` : `Requested by ${booking.renterName}`}</span></div>
    </div>
    <Link className={styles.bookingAction} href={`/bookings/${booking.id}`}>{actionLabel(booking, tab)}<ArrowRight size={16} /></Link>
  </article>;
}

function actionLabel(booking: Booking, tab: "renting" | "hosting") { if (booking.status === "REQUESTED") return tab === "hosting" ? "Review request" : "View request"; if (booking.status === "APPROVED") return tab === "renting" ? "Upload deposit proof" : "View booking"; if (booking.status === "DEPOSIT_PENDING") return tab === "hosting" ? "Confirm deposit" : "View proof status"; if (booking.status === "COMPLETED") return "Leave or view review"; return "View booking"; }
function formatDates(booking: Booking) { const format = (value: string) => new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`)); return booking.startDate === booking.endDate ? format(booking.startDate) : `${format(booking.startDate)} – ${format(booking.endDate)}`; }
function dateMarker(booking: Booking) { const start = new Date(`${booking.startDate}T00:00:00`); const end = new Date(`${booking.endDate}T00:00:00`); const month = new Intl.DateTimeFormat("en", { month: "short" }).format(start); const day = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(start); const detail = booking.startDate === booking.endDate ? String(start.getFullYear()) : `to ${new Intl.DateTimeFormat("en", { day: "numeric", month: start.getMonth() === end.getMonth() ? undefined : "short" }).format(end)}`; return { month, day, detail }; }
function humanize(value: string) { return value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase()); }
function statusClass(status: Booking["status"]) { return status === "ACTIVE" || status === "COMPLETED" ? "status-chip status-chip--verified" : "status-chip status-chip--requested"; }
