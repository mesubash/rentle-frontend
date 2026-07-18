"use client";

import Form from "next/form";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { ListingCard } from "./listing-card";
import { ApiError } from "@/lib/api/client";
import { categoriesApi, listingsApi, type Category, type ListingSummary, type ListingType } from "@/lib/api/listings";
import { DISTRICT_OPTIONS } from "@/lib/districts";

export function ExploreMarketplace({ initialQuery = "", home = false }: { initialQuery?: string; home?: boolean }) {
  const [query, setQuery] = useState(initialQuery);
  const [categoryId, setCategoryId] = useState("");
  const [district, setDistrict] = useState("");
  const [listingType, setListingType] = useState<ListingType | "">("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [sort, setSort] = useState("newest");
  const [categories, setCategories] = useState<Category[]>([]);
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");
  const [paginationError, setPaginationError] = useState("");
  const [requestKey, setRequestKey] = useState(0);
  const searchVersion = useRef(0);

  useEffect(() => {
    categoriesApi.tree().then((items) => setCategories(flattenCategories(items))).catch(() => undefined);
  }, []);

  useEffect(() => {
    let active = true;
    const version = ++searchVersion.current;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setLoadingMore(false);
      setError("");
      setPaginationError("");
      setListings([]);
      setTotal(0);
      setCurrentPage(0);
      setHasMore(false);
      listingsApi.search({ q: query.trim() || undefined, type: listingType || undefined, categoryId: categoryId || undefined, district: district || undefined, minPrice: optionalPrice(minPrice), maxPrice: optionalPrice(maxPrice), sort, page: 0, size: home ? 8 : 24 })
        .then((page) => { if (active && version === searchVersion.current) { setListings(page.content); setTotal(page.totalElements); setCurrentPage(page.page); setHasMore(!home && !page.last); } })
        .catch((caught) => active && version === searchVersion.current && setError(caught instanceof ApiError ? caught.message : "We could not load listings."))
        .finally(() => active && version === searchVersion.current && setLoading(false));
    }, 250);
    return () => { active = false; window.clearTimeout(timer); };
  }, [categoryId, district, home, listingType, maxPrice, minPrice, query, requestKey, sort]);

  async function loadMore() {
    if (home || loadingMore || !hasMore) return;
    const version = searchVersion.current;
    setLoadingMore(true);
    setPaginationError("");
    try {
      const page = await listingsApi.search({ q: query.trim() || undefined, type: listingType || undefined, categoryId: categoryId || undefined, district: district || undefined, minPrice: optionalPrice(minPrice), maxPrice: optionalPrice(maxPrice), sort, page: currentPage + 1, size: 24 });
      if (version !== searchVersion.current) return;
      setListings((current) => [...current, ...page.content]);
      setTotal(page.totalElements);
      setCurrentPage(page.page);
      setHasMore(!page.last);
    } catch (caught) {
      if (version === searchVersion.current) setPaginationError(caught instanceof ApiError ? caught.message : "We could not load more listings.");
    } finally {
      if (version === searchVersion.current) setLoadingMore(false);
    }
  }

  const hasFilters = Boolean(query || categoryId || district || listingType || minPrice || maxPrice);
  const selectedCategory = categories.find((item) => item.id === categoryId);
  const clear = () => { setQuery(""); setCategoryId(""); setDistrict(""); setListingType(""); setMinPrice(""); setMaxPrice(""); };

  return <>
    {home && <section className="market-masthead"><div className="container market-masthead__inner"><div><h1>Find what you need nearby.</h1><p>Rent useful things and book local skills in your area.</p></div><Form className="market-search" action="/explore"><Search size={20} aria-hidden="true" /><label className="sr-only" htmlFor="market-search">Search listings</label><input id="market-search" name="q" placeholder="Search cameras, tools, or services" /></Form></div></section>}
    <main className={home ? "page explore-page explore-page--home" : "page explore-page"}><div className="container">
      <div className="filter-scroll" aria-label="Listing categories"><button onClick={() => setCategoryId("")} className={!categoryId ? "filter-chip is-active" : "filter-chip"}>All</button>{categories.map((item) => <button key={item.id} onClick={() => setCategoryId(item.id)} className={categoryId === item.id ? "filter-chip is-active" : "filter-chip"}>{item.name}</button>)}</div>
      {!home && <>
        <details className="card card-pad" open={filtersOpen} onToggle={(event) => setFiltersOpen(event.currentTarget.open)}><summary className="button button--secondary button--small">Filters</summary><hr className="divider" /><div className="form-grid"><div className="field"><strong id="listing-type-filter">Listing type</strong><div className="filter-scroll" role="group" aria-labelledby="listing-type-filter"><button type="button" onClick={() => setListingType("")} className={!listingType ? "filter-chip is-active" : "filter-chip"}>All</button><button type="button" onClick={() => setListingType("PRODUCT")} className={listingType === "PRODUCT" ? "filter-chip is-active" : "filter-chip"}>Products</button><button type="button" onClick={() => setListingType("SERVICE")} className={listingType === "SERVICE" ? "filter-chip is-active" : "filter-chip"}>Services</button></div></div><div className="form-grid form-grid--two"><div className="field"><label htmlFor="district-filter"><MapPin size={16} aria-hidden="true" /> District</label><select id="district-filter" value={district} onChange={(event) => setDistrict(event.target.value)}>{DISTRICT_OPTIONS.map((option) => <option key={option.value || "all"} value={option.value}>{option.label}</option>)}</select></div><div className="form-grid form-grid--two"><div className="field"><label htmlFor="min-price-filter">Minimum price (NPR)</label><input id="min-price-filter" type="number" min="0" step="1" inputMode="numeric" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="No minimum" /></div><div className="field"><label htmlFor="max-price-filter">Maximum price (NPR)</label><input id="max-price-filter" type="number" min="0" step="1" inputMode="numeric" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="No maximum" /></div></div></div></div></details>
        <div className="explore-toolbar"><label className="sort-control"><SlidersHorizontal size={16} /><span className="sr-only">Sort listings</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest</option><option value="rating">Highest rated</option><option value="price_asc">Lowest price</option><option value="price_desc">Highest price</option></select><ChevronDown size={15} /></label></div>
        {hasFilters && <div className="active-filters"><strong>{total} result{total === 1 ? "" : "s"}</strong>{query && <button onClick={() => setQuery("")}>“{query}” <X size={13} /></button>}{selectedCategory && <button onClick={() => setCategoryId("")}>{selectedCategory.name} <X size={13} /></button>}{listingType && <button onClick={() => setListingType("")}>{listingType === "PRODUCT" ? "Products" : "Services"} <X size={13} /></button>}{district && <button onClick={() => setDistrict("")}>{district} <X size={13} /></button>}{minPrice && <button onClick={() => setMinPrice("")}>From NPR {Number(minPrice).toLocaleString("en-NP")} <X size={13} /></button>}{maxPrice && <button onClick={() => setMaxPrice("")}>Up to NPR {Number(maxPrice).toLocaleString("en-NP")} <X size={13} /></button>}<button className="clear-filters" onClick={clear}>Clear all</button></div>}
      </>}
      {home && <div className="section-heading"><h2>Fresh nearby</h2></div>}
      {loading ? <div className="listing-grid listing-grid--four" aria-label="Loading listings">{Array.from({ length: 8 }).map((_, index) => <div className="skeleton" key={index} />)}</div> : error ? <section className="empty-state card"><p className="eyebrow">Connection problem</p><h2>Listings could not be loaded.</h2><p>{error}</p><button className="button" onClick={() => setRequestKey((value) => value + 1)}>Try again</button></section> : listings.length ? <div className="listing-grid listing-grid--four">{listings.map((listing, index) => <ListingCard key={listing.id} listing={listing} priority={index < 2} />)}</div> : <section className="empty-state card"><p className="eyebrow">No exact matches</p><h2>Try a broader search.</h2><p>Remove one or more filters to see more nearby listings.</p><button className="button" onClick={clear}>Show all listings</button></section>}
      {!home && !loading && !error && listings.length > 0 && hasMore && <div className="load-more">{paginationError && <p className="form-error" role="alert">{paginationError}</p>}<button type="button" className="button button--secondary" disabled={loadingMore} onClick={loadMore}>{loadingMore ? "Loading…" : paginationError ? "Try loading more again" : "Load more"}</button></div>}
      {home && !error && <div className="see-more"><Link className="button" href="/explore">Explore all listings</Link></div>}
    </div></main>
  </>;
}

function flattenCategories(items: Category[]): Category[] {
  return items.flatMap((item) => [item, ...flattenCategories(item.children)]);
}

function optionalPrice(value: string) {
  if (!value) return undefined;
  const price = Number(value);
  return Number.isFinite(price) ? price : undefined;
}
