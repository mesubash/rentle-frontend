import type { Metadata } from "next";
import { ExploreMarketplace } from "@/components/explore-marketplace";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = { title: "Explore", description: "Browse verified items and local services available across Nepal." };

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  return <><ExploreMarketplace initialQuery={q} /><SiteFooter /></>;
}
