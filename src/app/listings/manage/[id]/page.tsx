import type { Metadata } from "next";
import { ListingManageView } from "@/components/listing-manage-view";
export const metadata: Metadata = { title: "Manage listing" };
export default async function ManageListingPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <ListingManageView listingId={id} />; }
