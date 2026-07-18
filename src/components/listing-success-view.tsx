"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ListingCard } from "./listing-card";
import { ShareListingButton } from "./share-listing-button";
import { listingsApi, type ListingDetail } from "@/lib/api/listings";

export function ListingSuccessView({ listingId }: { listingId?: string }) {
  const [listing, setListing] = useState<ListingDetail | null>(null);
  useEffect(() => {
    if (!listingId) return;
    listingsApi.detail(listingId).then(setListing).catch(() => undefined);
  }, [listingId]);

  return <main className="page"><div className="container publish-success"><section className="publish-success__message"><CheckCircle2 size={38} /><p className="eyebrow">Listing published</p><h1>Your listing is live.</h1><p>Renters can find it in Explore. New requests appear in your owner bookings.</p></section>{listing && <div className="listing-grid"><ListingCard listing={listing} priority /></div>}<div className="button-row">{listingId && <Link className="button" href={`/listing/${listingId}`}>View listing</Link>}<Link className="button button--secondary" href="/explore">Open Explore</Link>{listing && <ShareListingButton listingId={listing.id} title={listing.title} />}</div></div></main>;
}
