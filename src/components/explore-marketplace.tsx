"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ChevronDown, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { ListingCard } from "./listing-card";
import { ApiError } from "@/lib/api/client";
import { categoriesApi, listingsApi, type Category, type ListingSummary } from "@/lib/api/listings";

const districts = ["All Nepal", "Kathmandu", "Lalitpur", "Bhaktapur", "Kaski"];

export function ExploreMarketplace({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [categoryId, setCategoryId] = useState("");
  const [district, setDistrict] = useState("All Nepal");
  const [sort, setSort] = useState("newest");
  const [categories, setCategories] = useState<Category[]>([]);
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    categoriesApi.tree().then((items) => setCategories(flattenCategories(items))).catch(() => undefined);
  }, []);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true); setError("");
      listingsApi.search({ q: query.trim() || undefined, categoryId: categoryId || undefined, district: district === "All Nepal" ? undefined : district, sort, page: 0, size: 24 })
        .then((page) => { if (active) { setListings(page.content); setTotal(page.totalElements); } })
        .catch((caught) => active && setError(caught instanceof ApiError ? caught.message : "We could not load listings."))
        .finally(() => active && setLoading(false));
    }, 250);
    return () => { active = false; window.clearTimeout(timer); };
  }, [categoryId, district, query, requestKey, sort]);

  const hasFilters = Boolean(query || categoryId || district !== "All Nepal");
  const selectedCategory = categories.find((item) => item.id === categoryId);
  const clear = () => { setQuery(""); setCategoryId(""); setDistrict("All Nepal"); };

  return <>
    <section className="market-masthead"><div className="container market-masthead__inner"><div><p className="eyebrow eyebrow--light">Verified neighbors. Clear deposits.</p><h1>Find what you need nearby.</h1><p>Rent useful things and book local skills in your area.</p></div><div className="market-search"><Search size={20} aria-hidden="true" /><label className="sr-only" htmlFor="market-search">Search listings</label><input id="market-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search cameras, tools, or services" />{query && <button aria-label="Clear search" onClick={() => setQuery("")}><X size={18} /></button>}</div></div></section>
    <section className="trust-strip"><div className="container"><CheckCircle2 size={18} /><span>Verification status, price, and deposit are shown before you request a booking.</span></div></section>
    <main className="page explore-page"><div className="container">
      <div className="filter-scroll" aria-label="Listing categories"><button onClick={() => setCategoryId("")} className={!categoryId ? "filter-chip is-active" : "filter-chip"}>All</button>{categories.map((item) => <button key={item.id} onClick={() => setCategoryId(item.id)} className={categoryId === item.id ? "filter-chip is-active" : "filter-chip"}>{item.name}</button>)}</div>
      <div className="explore-toolbar"><div className="districts" aria-label="District filters"><MapPin size={16} />{districts.map((item) => <button key={item} onClick={() => setDistrict(item)} className={district === item ? "district-chip is-active" : "district-chip"}>{item}</button>)}</div><label className="sort-control"><SlidersHorizontal size={16} /><span className="sr-only">Sort listings</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest</option><option value="rating">Highest rated</option><option value="price_asc">Lowest price</option><option value="price_desc">Highest price</option></select><ChevronDown size={15} /></label></div>
      {hasFilters && <div className="active-filters"><strong>{total} result{total === 1 ? "" : "s"}</strong>{query && <button onClick={() => setQuery("")}>“{query}” <X size={13} /></button>}{selectedCategory && <button onClick={() => setCategoryId("")}>{selectedCategory.name} <X size={13} /></button>}{district !== "All Nepal" && <button onClick={() => setDistrict("All Nepal")}>{district} <X size={13} /></button>}<button className="clear-filters" onClick={clear}>Clear all</button></div>}
      {loading ? <div className="listing-grid listing-grid--four" aria-label="Loading listings">{Array.from({ length: 8 }).map((_, index) => <div className="skeleton" key={index} />)}</div> : error ? <section className="empty-state card"><p className="eyebrow">Connection problem</p><h2>Listings could not be loaded.</h2><p>{error}</p><button className="button" onClick={() => setRequestKey((value) => value + 1)}>Try again</button></section> : listings.length ? <div className="listing-grid listing-grid--four">{listings.map((listing, index) => <ListingCard key={listing.id} listing={listing} priority={index < 2} />)}</div> : <section className="empty-state card"><p className="eyebrow">No exact matches</p><h2>Try a broader search.</h2><p>Remove a category or district to see more nearby listings.</p><button className="button" onClick={clear}>Show all listings</button></section>}
    </div></main>
  </>;
}

function flattenCategories(items: Category[]): Category[] {
  return items.flatMap((item) => [item, ...flattenCategories(item.children)]);
}
