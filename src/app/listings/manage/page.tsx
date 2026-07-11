import type { Metadata } from "next";
import { ListingsManager } from "@/components/listings-manager";
export const metadata: Metadata = { title: "Manage listings" };
export default function ManageListingsPage() { return <ListingsManager />; }
