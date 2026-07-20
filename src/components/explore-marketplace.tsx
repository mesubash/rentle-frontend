"use client";

import Form from "next/form";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { ListingCard } from "./listing-card";
import { ApiError } from "@/lib/api/client";
import { categoriesApi, listingsApi, type Category, type ListingSummary, type ListingType } from "@/lib/api/listings";
import { DISTRICT_OPTIONS } from "@/lib/districts";

export function ExploreMarketplace({ initialQuery = "", home = false }: { initialQuery?: string; home?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageParam = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const currentPage = home || !Number.isFinite(pageParam) || pageParam < 1 ? 0 : pageParam - 1;
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
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState("");
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
      setError("");
      setListings([]);
      setTotal(0);
      setTotalPages(0);
      listingsApi.search({ q: query.trim() || undefined, type: listingType || undefined, categoryId: categoryId || undefined, district: district || undefined, minPrice: optionalPrice(minPrice), maxPrice: optionalPrice(maxPrice), sort, page: home ? 0 : currentPage, size: home ? 8 : 24 })
        .then((page) => { if (active && version === searchVersion.current) { setListings(page.content); setTotal(page.totalElements); setTotalPages(page.totalPages); } })
        .catch((caught) => active && version === searchVersion.current && setError(caught instanceof ApiError ? caught.message : "We could not load listings."))
        .finally(() => active && version === searchVersion.current && setLoading(false));
    }, 250);
    return () => { active = false; window.clearTimeout(timer); };
  }, [categoryId, currentPage, district, home, listingType, maxPrice, minPrice, query, requestKey, sort]);

  function updatePageUrl(page: number, replace = false) {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 0) params.delete("page");
    else params.set("page", String(page + 1));
    const href = `${pathname}${params.size ? `?${params.toString()}` : ""}`;
    if (replace) router.replace(href, { scroll: false });
    else router.push(href, { scroll: false });
  }

  function resetPage() {
    if (home || currentPage === 0) return;
    updatePageUrl(0, true);
  }

  function goToPage(page: number) {
    if (home || loading || page === currentPage || page < 0 || page >= totalPages) return;
    updatePageUrl(page);
    document.getElementById("explore-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function updateFilter<T>(setter: (value: T) => void, value: T) {
    resetPage();
    setter(value);
  }

  const hasFilters = Boolean(query || categoryId || district || listingType || minPrice || maxPrice);
  const selectedCategory = categories.find((item) => item.id === categoryId);
  const clear = () => { resetPage(); setQuery(""); setCategoryId(""); setDistrict(""); setListingType(""); setMinPrice(""); setMaxPrice(""); };

  return <>
    {home && <section className="market-masthead"><div className="container market-masthead__inner"><div><h1>Find what you need nearby.</h1><p>Rent useful things and book local skills in your area.</p></div><Form className="market-search" action="/explore"><Search size={20} aria-hidden="true" /><label className="sr-only" htmlFor="market-search">Search listings</label><input id="market-search" name="q" placeholder="Search cameras, tools, or services" /></Form></div></section>}
    <main className={home ? "page explore-page explore-page--home" : "page explore-page"}><div className="container">
      <div className="filter-scroll" aria-label="Listing categories"><button onClick={() => updateFilter(setCategoryId, "")} className={!categoryId ? "filter-chip is-active" : "filter-chip"}>All</button>{categories.map((item) => <button key={item.id} onClick={() => updateFilter(setCategoryId, item.id)} className={categoryId === item.id ? "filter-chip is-active" : "filter-chip"}>{item.name}</button>)}</div>
      {!home && <>
        <details className="card card-pad" open={filtersOpen} onToggle={(event) => setFiltersOpen(event.currentTarget.open)}><summary className="button button--secondary button--small">Filters</summary><hr className="divider" /><div className="form-grid"><div className="field"><strong id="listing-type-filter">Listing type</strong><div className="filter-scroll" role="group" aria-labelledby="listing-type-filter"><button type="button" onClick={() => updateFilter(setListingType, "")} className={!listingType ? "filter-chip is-active" : "filter-chip"}>All</button><button type="button" onClick={() => updateFilter(setListingType, "PRODUCT")} className={listingType === "PRODUCT" ? "filter-chip is-active" : "filter-chip"}>Products</button><button type="button" onClick={() => updateFilter(setListingType, "SERVICE")} className={listingType === "SERVICE" ? "filter-chip is-active" : "filter-chip"}>Services</button></div></div><div className="form-grid form-grid--two"><div className="field"><label htmlFor="district-filter"><MapPin size={16} aria-hidden="true" /> District</label><select id="district-filter" value={district} onChange={(event) => updateFilter(setDistrict, event.target.value)}>{DISTRICT_OPTIONS.map((option) => <option key={option.value || "all"} value={option.value}>{option.label}</option>)}</select></div><div className="form-grid form-grid--two"><div className="field"><label htmlFor="min-price-filter">Minimum price (NPR)</label><input id="min-price-filter" type="number" min="0" step="1" inputMode="numeric" value={minPrice} onChange={(event) => updateFilter(setMinPrice, event.target.value)} placeholder="No minimum" /></div><div className="field"><label htmlFor="max-price-filter">Maximum price (NPR)</label><input id="max-price-filter" type="number" min="0" step="1" inputMode="numeric" value={maxPrice} onChange={(event) => updateFilter(setMaxPrice, event.target.value)} placeholder="No maximum" /></div></div></div></div></details>
        <div className="explore-toolbar"><label className="sort-control"><SlidersHorizontal size={16} /><span className="sr-only">Sort listings</span><select value={sort} onChange={(event) => updateFilter(setSort, event.target.value)}><option value="newest">Newest</option><option value="rating">Highest rated</option><option value="price_asc">Lowest price</option><option value="price_desc">Highest price</option></select><ChevronDown size={15} /></label></div>
        {hasFilters && <div className="active-filters"><strong>{total} result{total === 1 ? "" : "s"}</strong>{query && <button onClick={() => updateFilter(setQuery, "")}>“{query}” <X size={13} /></button>}{selectedCategory && <button onClick={() => updateFilter(setCategoryId, "")}>{selectedCategory.name} <X size={13} /></button>}{listingType && <button onClick={() => updateFilter(setListingType, "")}>{listingType === "PRODUCT" ? "Products" : "Services"} <X size={13} /></button>}{district && <button onClick={() => updateFilter(setDistrict, "")}>{district} <X size={13} /></button>}{minPrice && <button onClick={() => updateFilter(setMinPrice, "")}>From NPR {Number(minPrice).toLocaleString("en-NP")} <X size={13} /></button>}{maxPrice && <button onClick={() => updateFilter(setMaxPrice, "")}>Up to NPR {Number(maxPrice).toLocaleString("en-NP")} <X size={13} /></button>}<button className="clear-filters" onClick={clear}>Clear all</button></div>}
      </>}
      {home && <div className="section-heading"><h2>Fresh nearby</h2></div>}
      <div id="explore-results" className="explore-results-anchor" />
      {loading ? <div className="listing-grid listing-grid--four" aria-label="Loading listings">{Array.from({ length: 8 }).map((_, index) => <div className="skeleton" key={index} />)}</div> : error ? <section className="empty-state card"><p className="eyebrow">Connection problem</p><h2>Listings could not be loaded.</h2><p>{error}</p><button className="button" onClick={() => setRequestKey((value) => value + 1)}>Try again</button></section> : listings.length ? <div className="listing-grid listing-grid--four">{listings.map((listing, index) => <ListingCard key={listing.id} listing={listing} priority={index < 2} />)}</div> : <section className="empty-state card"><p className="eyebrow">No exact matches</p><h2>Try a broader search.</h2><p>Remove one or more filters to see more nearby listings.</p><button className="button" onClick={clear}>Show all listings</button></section>}
      {!home && !loading && !error && listings.length > 0 && <ExplorePagination currentPage={currentPage} totalPages={totalPages} total={total} count={listings.length} onChange={goToPage} />}
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

function ExplorePagination({ currentPage, totalPages, total, count, onChange }: { currentPage: number; totalPages: number; total: number; count: number; onChange: (page: number) => void }) {
  const start = currentPage * 24 + 1;
  const end = Math.min(start + count - 1, total);

  return (
    <nav className="explore-pagination" aria-label="Listing pages">
      <p>Showing <strong>{start}–{end}</strong> of <strong>{total}</strong> listings</p>
      <div className="explore-pagination__controls">
        <button type="button" className="pagination-button pagination-button--wide" disabled={currentPage === 0} onClick={() => onChange(currentPage - 1)}>
          <ChevronLeft size={17} /> Previous
        </button>
        <div className="explore-pagination__pages">
          {paginationItems(currentPage, totalPages).map((item) => typeof item === "number" ? (
            <button key={item} type="button" className={item === currentPage ? "pagination-button is-active" : "pagination-button"} aria-label={`Page ${item + 1}`} aria-current={item === currentPage ? "page" : undefined} onClick={() => onChange(item)}>{item + 1}</button>
          ) : <span key={item} aria-hidden="true">…</span>)}
        </div>
        <button type="button" className="pagination-button pagination-button--wide" disabled={currentPage >= totalPages - 1} onClick={() => onChange(currentPage + 1)}>
          Next <ChevronRight size={17} />
        </button>
      </div>
    </nav>
  );
}

function paginationItems(currentPage: number, totalPages: number): Array<number | string> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index);

  const items: Array<number | string> = [0];
  let start = Math.max(1, currentPage - 1);
  let end = Math.min(totalPages - 2, currentPage + 1);
  if (currentPage <= 3) end = 4;
  if (currentPage >= totalPages - 4) start = totalPages - 5;
  if (start > 1) items.push("start-ellipsis");
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < totalPages - 2) items.push("end-ellipsis");
  items.push(totalPages - 1);
  return items;
}
