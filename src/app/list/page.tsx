import type { Metadata } from "next";
import { ListingWizard } from "@/components/listing-wizard";
export const metadata: Metadata = { title: "List an item" };
export default function ListItemPage() { return <ListingWizard />; }
