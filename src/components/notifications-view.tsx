"use client";

import Link from "next/link";
import { CalendarCheck, CheckCircle2, MessageCircle, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "./auth-provider";
import { bookingsApi, type Booking } from "@/lib/api/bookings";

export function NotificationsView() {
  const { user } = useAuth(); const [renting, setRenting] = useState<Booking[]>([]); const [hosting, setHosting] = useState<Booking[]>([]); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  useEffect(() => { Promise.all([bookingsApi.asRenter(0,50), bookingsApi.asOwner(0,50)]).then(([renter, owner]) => { setRenting(renter.content); setHosting(owner.content); }).catch(() => setError("Activity could not be loaded.")).finally(() => setLoading(false)); }, []);
  const actions = [
    ...hosting.filter((booking) => booking.status === "REQUESTED").map((booking) => ({ icon: CalendarCheck, title: `Review ${booking.renterName}’s request`, copy: `${booking.listingTitle} · ${booking.startDate} to ${booking.endDate}`, href: `/bookings/${booking.id}`, date: booking.createdAt })),
    ...hosting.filter((booking) => booking.status === "DEPOSIT_PENDING").map((booking) => ({ icon: ShieldCheck, title: "Check a deposit transfer", copy: `${booking.renterName} attached proof for ${booking.listingTitle}.`, href: `/bookings/${booking.id}`, date: booking.createdAt })),
    ...renting.filter((booking) => booking.status === "APPROVED").map((booking) => ({ icon: CalendarCheck, title: "Your booking was approved", copy: `${booking.listingTitle} is ready for the next step.`, href: `/bookings/${booking.id}`, date: booking.createdAt })),
    ...[...renting, ...hosting].filter((booking) => ["APPROVED", "DEPOSIT_PENDING", "ACTIVE"].includes(booking.status)).map((booking) => ({ icon: MessageCircle, title: `Conversation open for ${booking.listingTitle}`, copy: "Keep timing and handover changes in the booking thread.", href: `/messages/${booking.id}`, date: booking.createdAt })),
  ].sort((a,b) => b.date.localeCompare(a.date));
  return <main className="page"><div className="container notifications-page"><header className="page-header"><p className="eyebrow">Account activity</p><h1>Notifications</h1><p>These reminders are derived from the current state of your bookings.</p></header>{error && <p className="form-error">{error}</p>}<div className="notification-list">{actions.map(({ icon: Icon, title, copy, href }, index) => <Link className="notification-card card" href={href} key={`${href}-${index}`}><span><Icon size={19} /></span><div><strong>{title}</strong><p>{copy}</p></div></Link>)}{user && user.kycStatus == null && <Link className="notification-card card" href="/verification"><span><ShieldCheck size={19} /></span><div><strong>Complete identity verification</strong><p>Submit your identity details for admin review.</p></div></Link>}{user && user.kycStatus === "REJECTED" && <Link className="notification-card card" href="/verification"><span><ShieldCheck size={19} /></span><div><strong>Identity verification needs attention</strong><p>Your submission was rejected. Review and resubmit.</p></div></Link>}</div>{loading && !actions.length && <p className="message-date">Loading your activity…</p>}{!loading && !actions.length && (!user || user.kycStatus != null) && <div className="inline-success"><CheckCircle2 size={18} /><span>You have no booking actions waiting.</span></div>}</div></main>;
}
