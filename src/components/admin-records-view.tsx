"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import type { Booking } from "@/lib/api/bookings";
import { priceUnitLabel, type ListingSummary } from "@/lib/api/listings";
import { formatNpr } from "@/lib/data";

export function AdminRecordsView({ kind }: { kind: "bookings" | "listings" }) {
  const [bookings, setBookings] = useState<Booking[]>([]); const [listings, setListings] = useState<ListingSummary[]>([]); const [error, setError] = useState("");
  useEffect(() => { if (kind === "bookings") adminApi.bookings().then((page) => setBookings(page.content)).catch(() => setError("Bookings could not be loaded.")); else adminApi.listings().then((page) => setListings(page.content)).catch(() => setError("Listings could not be loaded.")); }, [kind]);
  return <><header className="admin-page-header"><div><p className="eyebrow">{kind === "bookings" ? "Agreement records" : "Marketplace inventory"}</p><h1>{kind === "bookings" ? "Bookings" : "Listings"}</h1><p>Read-only operational records for support and safety review.</p></div><span className="queue-count">{kind === "bookings" ? bookings.length : listings.length} shown</span></header>{error && <p className="form-error">{error}</p>}<section className="admin-data-table card"><div className="admin-data-row admin-data-head"><span>{kind === "bookings" ? "Booking" : "Listing"}</span><span>Type</span><span>Status</span><span>Amount</span></div>{kind === "bookings" ? bookings.map((booking) => <div className="admin-data-row" key={booking.id}><span><strong>{booking.listingTitle}</strong><small>{booking.renterName} → {booking.ownerName} · #{booking.id.slice(0,8)}</small></span><span>{humanize(booking.listingType)}</span><span><b className="status-chip status-chip--requested">{humanize(booking.status)}</b></span><span>{formatNpr(booking.totalPrice)}<small>Deposit {formatNpr(booking.depositAmount)}</small></span></div>) : listings.map((listing) => <div className="admin-data-row" key={listing.id}><span><strong><Link href={`/listing/${listing.id}`}>{listing.title}</Link></strong><small>{listing.district} · #{listing.id.slice(0,8)}</small></span><span>{humanize(listing.type)}</span><span><b className={listing.status === "ACTIVE" ? "status-chip status-chip--verified" : "status-chip status-chip--requested"}>{humanize(listing.status)}</b></span><span>{formatNpr(listing.pricePerUnit)} / {priceUnitLabel(listing.priceUnit)}</span></div>)}</section></>;
}
function humanize(value: string) { return value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase()); }
