import type { Metadata } from "next";
import { ListingDetailView } from "@/components/listing-detail-view";
import { assetUrl } from "@/lib/api/assets";
import type { ListingDetail } from "@/lib/api/listings";
import { serverRead } from "@/lib/api/server";

function readListing(slug: string) {
  return serverRead<ListingDetail>(`/listings/${slug}`);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const listing = await readListing(slug);
  if (!listing) return { title: "Listing" };

  const image = assetUrl(listing.coverImage);
  const description = listing.description?.slice(0, 160) || `Available in ${listing.district}.`;
  return {
    title: listing.title,
    description,
    openGraph: {
      title: listing.title,
      description,
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Fetched here so the listing is in the initial HTML and the calendar, booking panel and
  // reviews mount immediately, rather than queueing behind a client-side round trip.
  // Null (backend down, or not found) falls through to the client fetch, which renders the
  // existing error state.
  const listing = await readListing(slug);
  return <ListingDetailView listingId={slug} initialListing={listing} />;
}
