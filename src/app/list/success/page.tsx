import type { Metadata } from "next";
import { ListingSuccessView } from "@/components/listing-success-view";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = { title: "Listing published" };

export default async function ListingSuccessPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  return <>
    <ListingSuccessView listingId={id} />
    <SiteFooter prompt={{
      title: "Ready for the first request?",
      description: "New requests and handover details appear in your bookings.",
      href: "/bookings",
      label: "Open bookings",
    }} />
  </>;
}
