import { Suspense } from "react";
import type { Metadata } from "next";
import { ExploreMarketplace } from "@/components/explore-marketplace";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = { title: "Search results", description: "Search verified rental items and local services across Nepal." };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  return <><Suspense fallback={null}><ExploreMarketplace initialQuery={q} /></Suspense><SiteFooter /></>;
}
