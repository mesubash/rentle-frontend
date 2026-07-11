"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ListingCard } from "./listing-card";
import { ReviewList } from "./review-list";
import { listingsApi, type ListingSummary } from "@/lib/api/listings";

export function ProfileActivity({ userId, own }: { userId: string; own: boolean }) {
  const [listings, setListings] = useState<ListingSummary[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { listingsApi.byUser(userId, 0, 50).then((page) => setListings(page.content)).catch(() => setError("Listings could not be loaded.")).finally(() => setLoading(false)); }, [userId]);
  return <><section className="profile-section"><div className="section-heading"><h2>Listings</h2>{own && <div className="button-row"><Link className="button button--secondary button--small" href="/list">Add listing</Link><Link className="button button--secondary button--small" href="/listings/manage">Manage listings</Link></div>}</div>{loading ? <div className="listing-grid"><div className="skeleton" /><div className="skeleton" /></div> : error ? <div className="inline-notice" role="status">{error}</div> : listings.length ? <div className="listing-grid">{listings.map((listing) => <ListingCard listing={listing} key={listing.id} />)}</div> : <p className="empty-note">No active listings yet.</p>}</section><section className="profile-section"><h2>Reviews</h2><ReviewList userId={userId} /></section></>;
}
