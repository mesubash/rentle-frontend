"use client";

import Form from "next/form";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { ListingCard } from "./listing-card";
import { FilterChipGroup } from "./filter-chip-group";
import { ListingPagination } from "./listing-pagination";
import { MarketplaceFilterBar } from "./marketplace-filter-bar";
import { ApiError } from "@/lib/api/client";
import { categoriesApi, listingsApi, type Category, type ListingSummary, type ListingType } from "@/lib/api/listings";

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
      const parsedMin = optionalPrice(minPrice);
      const parsedMax = optionalPrice(maxPrice);
      const rangeValid = parsedMin === undefined || parsedMax === undefined || parsedMin <= parsedMax;
      listingsApi.search({ q: query.trim() || undefined, type: listingType || undefined, categoryId: categoryId || undefined, district: district || undefined, minPrice: rangeValid ? parsedMin : undefined, maxPrice: rangeValid ? parsedMax : undefined, sort, page: home ? 0 : currentPage, size: home ? 8 : 24 })
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

  function updatePriceRange(min: string, max: string) {
    resetPage();
    setMinPrice(min);
    setMaxPrice(max);
  }

  const hasFilters = Boolean(query || categoryId || district || listingType || minPrice || maxPrice);
  const categoryOptions = [{ value: "", label: "All" }, ...categories.map((item) => ({ value: item.id, label: item.name }))];
  const clear = () => { resetPage(); setQuery(""); setCategoryId(""); setDistrict(""); setListingType(""); setMinPrice(""); setMaxPrice(""); };

  return <>
    {home && <section className="market-masthead"><div className="container market-masthead__inner"><div><h1>Find what you need nearby.</h1><p>Rent useful things and book local skills in your area.</p></div><Form className="market-search" action="/explore"><Search size={20} aria-hidden="true" /><label className="sr-only" htmlFor="market-search">Search listings</label><input id="market-search" name="q" placeholder="Search cameras, tools, or services" /></Form></div></section>}
    <main className={home ? "page explore-page explore-page--home" : "page explore-page"}><div className="container">
      {home ? <FilterChipGroup options={categoryOptions} value={categoryId} onChange={(value) => updateFilter(setCategoryId, value)} ariaLabel="Listing categories" /> : <>
        <FilterChipGroup options={categoryOptions} value={categoryId} onChange={(value) => updateFilter(setCategoryId, value)} ariaLabel="Listing categories" />
        <MarketplaceFilterBar listingType={listingType} district={district} minPrice={minPrice} maxPrice={maxPrice} sort={sort} onTypeChange={(value) => updateFilter(setListingType, value)} onDistrictChange={(value) => updateFilter(setDistrict, value)} onPriceChange={updatePriceRange} onSortChange={(value) => updateFilter(setSort, value)} onClear={clear} showClear={hasFilters} />
        <div className="filter-results-meta"><strong>{loading ? "Finding listings…" : `${total} listing${total === 1 ? "" : "s"}`}</strong></div>
      </>}
      {home && <div className="section-heading"><h2>Fresh nearby</h2></div>}
      <div id="explore-results" className="explore-results-anchor" />
      {loading ? <div className="listing-grid listing-grid--four" aria-label="Loading listings">{Array.from({ length: 8 }).map((_, index) => <div className="skeleton" key={index} />)}</div> : error ? <section className="empty-state card"><p className="eyebrow">Connection problem</p><h2>Listings could not be loaded.</h2><p>{error}</p><button className="button" onClick={() => setRequestKey((value) => value + 1)}>Try again</button></section> : listings.length ? <div className="listing-grid listing-grid--four">{listings.map((listing, index) => <ListingCard key={listing.id} listing={listing} priority={index < 2} />)}</div> : <section className="empty-state card"><p className="eyebrow">No exact matches</p><h2>Try a broader search.</h2><p>Remove one or more filters to see more nearby listings.</p><button className="button" onClick={clear}>Show all listings</button></section>}
      {!home && !loading && !error && listings.length > 0 && <ListingPagination currentPage={currentPage} totalPages={totalPages} total={total} count={listings.length} pageSize={24} onChange={goToPage} />}
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
