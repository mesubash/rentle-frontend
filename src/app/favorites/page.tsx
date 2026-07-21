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
      <main className="page favorites-page">
        <div className="container">
          <header className="favorites-header">
            <div>
              <p className="eyebrow">Your saved list</p>
              <h1>Things worth coming back to.</h1>
            </div>
            <p>Keep useful finds together while you compare the details and decide what to request.</p>
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
              {listings.map((listing, index) => <ListingCard key={listing.id} listing={listing} priority={index < 4} />)}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
