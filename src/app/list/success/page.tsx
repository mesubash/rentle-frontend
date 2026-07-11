import type { Metadata } from "next";
import { ListingSuccessView } from "@/components/listing-success-view";

export const metadata: Metadata = { title: "Listing published" };

export default async function ListingSuccessPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  return <ListingSuccessView listingId={id} />;
}
