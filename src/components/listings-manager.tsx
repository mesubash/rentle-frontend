"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ListingCard } from "./listing-card";
import { listingsApi, type ListingSummary } from "@/lib/api/listings";

export function ListingsManager() {
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { listingsApi.mine(0, 50).then((page) => setListings(page.content)).catch(() => setError("Your listings could not be loaded." )).finally(() => setLoading(false)); }, []);
  return <main className="page"><div className="container"><header className="page-header"><p className="eyebrow">Owner workspace</p><h1>Manage listings</h1><p>Update availability, pricing, photos, and publishing status.</p><Link className="button" href="/list">Create listing</Link></header>{loading ? <div className="listing-grid">{[1,2,3].map((item) => <div className="skeleton" key={item} />)}</div> : error ? <section className="empty-state card"><h2>Could not load listings</h2><p>{error}</p></section> : listings.length ? <div className="listing-grid">{listings.map((listing) => <div key={listing.id}><ListingCard listing={listing} hideFav /><Link className="button button--secondary button--small" href={`/listings/manage/${listing.id}`}>Manage {listing.title}</Link></div>)}</div> : <section className="empty-state card"><h2>You have no listings yet.</h2><p>Create one with real details and current photos.</p><Link className="button" href="/list">Create your first listing</Link></section>}</div></main>;
}
