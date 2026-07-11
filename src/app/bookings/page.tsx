"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import { images } from "@/lib/data";

const bookings = [
  { id: "RNT-8924", title: "Sony Alpha A7 IV Camera", date: "18–20 Aug 2026", person: "Sarah M.", status: "Deposit pending", action: "Upload deposit proof", image: images.sony },
  { id: "RNT-8802", title: "Bosch Professional Drill Set", date: "10–12 Aug 2026", person: "Roshan P.", status: "Active", action: "View handover", image: images.drill },
  { id: "RNT-8741", title: "Traditional Daura Suruwal Set", date: "2–4 Aug 2026", person: "Aayush S.", status: "Completed", action: "Leave a review", image: images.daura },
  { id: "RNT-8655", title: "Four-Person Camping Tent", date: "22–24 Jul 2026", person: "Suman G.", status: "Completed", action: "View booking", image: images.tent },
];
const ownerBookings = [
  { id: "RNT-9018", title: "Canon EOS R5 Mirrorless Camera", date: "24–26 Aug 2026", person: "Nabin Karki", status: "Requested", action: "Approve or decline", image: images.canon },
  { id: "RNT-9020", title: "Canon EOS R5 Mirrorless Camera", date: "14–16 Aug 2026", person: "Nabin Karki", status: "Deposit pending", action: "Confirm deposit", image: images.canon },
];

export default function BookingsPage() {
  const [tab, setTab] = useState<"renting" | "hosting">("renting");
  return (
    <main className="page"><div className="container bookings-page">
      <header className="page-header"><p className="eyebrow">Your activity</p><h1>Bookings</h1><p>Every agreement, deposit proof, and message stays attached to its booking.</p></header>
      <div className="tabs" role="tablist"><button role="tab" aria-selected={tab === "renting"} className={tab === "renting" ? "is-active" : ""} onClick={() => setTab("renting")}>Renting</button><button role="tab" aria-selected={tab === "hosting"} className={tab === "hosting" ? "is-active" : ""} onClick={() => setTab("hosting")}>My listings’ bookings <span>1</span></button></div>
      <div className="booking-list">{(tab === "renting" ? bookings : ownerBookings).map((booking) => <article className="booking-card card" key={booking.id}><div className="booking-card__image"><Image src={booking.image} alt="" fill sizes="120px" /></div><div className="booking-card__main"><div className="booking-card__top"><span className={booking.status === "Completed" || booking.status === "Active" ? "status-chip status-chip--verified" : "status-chip status-chip--requested"}><Clock3 size={13} />{booking.status}</span><small>#{booking.id}</small></div><h2>{booking.title}</h2><p><CalendarDays size={15} /> {booking.date} · with {booking.person}</p><Link className="booking-card__action" href={`/bookings/${booking.id}`}>{booking.action}<ArrowRight size={16} /></Link></div></article>)}</div>
    </div></main>
  );
}
