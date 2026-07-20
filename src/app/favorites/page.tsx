"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { favoritesApi } from "@/lib/api/favorites";
import type { ListingSummary } from "@/lib/api/listings";
import { ListingCard } from "@/components/listing-card";
import { useAuth } from "@/components/auth-provider";
import { SiteFooter } from "@/components/site-footer";

export default function FavoritesPage() {
  const { user, loading } = useAuth();
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return;
    const load = user ? favoritesApi.list() : Promise.resolve<ListingSummary[]>([]);
    load.then(setListings).catch(() => undefined).finally(() => setReady(true));
  }, [user, loading]);

  return (
    <>
      <main className="page">
        <div className="container">
          <header className="trust-hero" style={{ textAlign: "left", marginBottom: 24 }}>
            <p className="eyebrow">Your list</p>
            <h1>Saved listings</h1>
          </header>
          {!ready && <p>Loading…</p>}
          {ready && !user && (
            <section className="empty-state">
              <Heart size={26} />
              <h2>Log in to save listings</h2>
              <p>Tap the heart on any listing to keep it here.</p>
              <Link className="button" href="/login">Log in</Link>
            </section>
          )}
          {ready && user && listings.length === 0 && (
            <section className="empty-state">
              <Heart size={26} />
              <h2>Nothing saved yet</h2>
              <p>Tap the heart on a listing to save it for later.</p>
              <Link className="button" href="/explore">Browse listings</Link>
            </section>
          )}
          {ready && user && listings.length > 0 && (
            <div className="listing-grid">
              {listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
