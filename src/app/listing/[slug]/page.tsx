import type { Metadata } from "next";
import { ListingDetailView } from "@/components/listing-detail-view";

export const metadata: Metadata = { title: "Listing" };

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ListingDetailView listingId={slug} />;
}
