"use client";

import { useMemo, useState, useTransition } from "react";
import { CheckCircle2, ChevronDown, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { ListingCard } from "./listing-card";
import { listings } from "@/lib/data";

const categories = ["All", "Cameras & Tech", "Traditional Clothing", "Tools & Camping", "Event & Photography"];
const districts = ["All Nepal", "Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara"];

export function ExploreMarketplace({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("All");
  const [district, setDistrict] = useState("All Nepal");
  const [sort, setSort] = useState("recommended");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const result = listings.filter((listing) =>
      (!normalized || `${listing.title} ${listing.category} ${listing.area} ${listing.district}`.toLowerCase().includes(normalized)) &&
      (category === "All" || listing.category === category) &&
      (district === "All Nepal" || listing.district === district)
    );
    return [...result].sort((a, b) => sort === "price-low" ? a.price - b.price : sort === "rating" ? b.rating - a.rating : b.reviewCount - a.reviewCount);
  }, [query, category, district, sort]);

  const update = (callback: () => void) => startTransition(callback);
  const hasFilters = query || category !== "All" || district !== "All Nepal";

  return (
    <>
      <section className="market-masthead">
        <div className="container market-masthead__inner">
          <div>
            <p className="eyebrow eyebrow--light">Verified neighbors. Clear deposits.</p>
            <h1>Find what you need nearby.</h1>
            <p>Rent useful things and book local skills across Kathmandu Valley and Pokhara.</p>
          </div>
          <div className="market-search">
            <Search size={20} aria-hidden="true" />
            <label className="sr-only" htmlFor="market-search">Search listings</label>
            <input id="market-search" value={query} onChange={(event) => update(() => setQuery(event.target.value))} placeholder="Try “camera in Bhaktapur”" />
            {query && <button aria-label="Clear search" onClick={() => setQuery("")}><X size={18} /></button>}
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <div className="container"><CheckCircle2 size={18} /><span>Every owner is phone-verified. Citizenship verification is shown on each profile.</span></div>
      </section>

      <main className="page explore-page">
        <div className="container">
          <div className="filter-scroll" aria-label="Listing categories">
            {categories.map((item) => <button key={item} onClick={() => update(() => setCategory(item))} className={category === item ? "filter-chip is-active" : "filter-chip"}>{item}</button>)}
          </div>

          <div className="explore-toolbar">
            <div className="districts" aria-label="District filters">
              <MapPin size={16} />
              {districts.map((item) => <button key={item} onClick={() => update(() => setDistrict(item))} className={district === item ? "district-chip is-active" : "district-chip"}>{item}</button>)}
            </div>
            <label className="sort-control"><SlidersHorizontal size={16} /><span className="sr-only">Sort listings</span><select value={sort} onChange={(event) => update(() => setSort(event.target.value))}><option value="recommended">Recommended</option><option value="rating">Highest rated</option><option value="price-low">Lowest price</option></select><ChevronDown size={15} /></label>
          </div>

          {hasFilters && (
            <div className="active-filters">
              <strong>{filtered.length} result{filtered.length === 1 ? "" : "s"}</strong>
              {query && <button onClick={() => setQuery("")}>“{query}” <X size={13} /></button>}
              {category !== "All" && <button onClick={() => setCategory("All")}>{category} <X size={13} /></button>}
              {district !== "All Nepal" && <button onClick={() => setDistrict("All Nepal")}>{district} <X size={13} /></button>}
              <button className="clear-filters" onClick={() => { setQuery(""); setCategory("All"); setDistrict("All Nepal"); }}>Clear all</button>
            </div>
          )}

          {isPending ? (
            <div className="listing-grid listing-grid--four" aria-label="Loading listings">{Array.from({ length: 4 }).map((_, index) => <div className="skeleton" key={index} />)}</div>
          ) : filtered.length ? (
            <div className="listing-grid listing-grid--four">{filtered.map((listing, index) => <ListingCard key={listing.slug} listing={listing} priority={index < 2} />)}</div>
          ) : (
            <section className="empty-state card">
              <p className="eyebrow">No exact matches</p><h2>Try a nearby district.</h2><p>“Camera” in Kathmandu or Lalitpur usually has the most results. Your filters are safe to change.</p>
              <button className="button" onClick={() => { setQuery(""); setCategory("All"); setDistrict("All Nepal"); }}>Show all listings</button>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
