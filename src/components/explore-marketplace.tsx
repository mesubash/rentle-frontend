"use client";

import Form from "next/form";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { ListingCard } from "./listing-card";
import { FilterChipGroup } from "./filter-chip-group";
import { ListingPagination } from "./listing-pagination";
import { ApiError } from "@/lib/api/client";
import { categoriesApi, listingsApi, type Category, type ListingSummary, type ListingType } from "@/lib/api/listings";
import { DISTRICT_OPTIONS } from "@/lib/districts";
import filterStyles from "./explore-filters.module.css";

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
  const [filtersOpen, setFiltersOpen] = useState(false);
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

  function updatePrice(kind: "min" | "max", value: string) {
    resetPage();
    const sanitized = value.replace(/\D/g, "");
    if (kind === "min") setMinPrice(sanitized);
    else setMaxPrice(sanitized);
  }

  function normalizePriceRange(kind: "min" | "max") {
    if (!minPrice || !maxPrice || Number(minPrice) <= Number(maxPrice)) return;
    if (kind === "min") setMaxPrice(minPrice);
    else setMinPrice(maxPrice);
  }

  const hasFilters = Boolean(query || categoryId || district || listingType || minPrice || maxPrice);
  const selectedCategory = categories.find((item) => item.id === categoryId);
  const categoryOptions = [{ value: "", label: "All" }, ...categories.map((item) => ({ value: item.id, label: item.name }))];
  const panelFilterCount = [listingType, district, minPrice, maxPrice].filter(Boolean).length;
  const invalidPriceRange = Boolean(minPrice && maxPrice && Number(minPrice) > Number(maxPrice));
  const clear = () => { resetPage(); setQuery(""); setCategoryId(""); setDistrict(""); setListingType(""); setMinPrice(""); setMaxPrice(""); };

  return <>
    {home && <section className="market-masthead"><div className="container market-masthead__inner"><div><h1>Find what you need nearby.</h1><p>Rent useful things and book local skills in your area.</p></div><Form className="market-search" action="/explore"><Search size={20} aria-hidden="true" /><label className="sr-only" htmlFor="market-search">Search listings</label><input id="market-search" name="q" placeholder="Search cameras, tools, or services" /></Form></div></section>}
    <main className={home ? "page explore-page explore-page--home" : "page explore-page"}><div className="container">
      {home ? <FilterChipGroup options={categoryOptions} value={categoryId} onChange={(value) => updateFilter(setCategoryId, value)} ariaLabel="Listing categories" /> : <>
        <section className={filterStyles.controls} aria-label="Listing controls">
          <FilterChipGroup options={categoryOptions} value={categoryId} onChange={(value) => updateFilter(setCategoryId, value)} ariaLabel="Listing categories" contained />
          <div className={filterStyles.toolbar}>
            <button type="button" className={filtersOpen ? `${filterStyles.toggle} ${filterStyles.isOpen}` : filterStyles.toggle} aria-expanded={filtersOpen} aria-controls="advanced-listing-filters" onClick={() => setFiltersOpen((current) => !current)}><SlidersHorizontal size={17} /><strong>Filters</strong><small>{panelFilterCount ? `${panelFilterCount} active` : "Type, location and price"}</small><ChevronDown size={17} /></button>
            <label className={`${filterStyles.sort} sort-control`}><SlidersHorizontal size={16} /><span className="sr-only">Sort listings</span><select value={sort} onChange={(event) => updateFilter(setSort, event.target.value)}><option value="newest">Newest</option><option value="rating">Highest rated</option><option value="price_asc">Lowest price</option><option value="price_desc">Highest price</option></select><ChevronDown size={15} /></label>
          </div>
          {filtersOpen && <div id="advanced-listing-filters" className={filterStyles.content}>
            <div className={filterStyles.typeField}><strong id="listing-type-filter">Listing type</strong><FilterChipGroup options={[{ value: "", label: "All" }, { value: "PRODUCT", label: "Products" }, { value: "SERVICE", label: "Services" }]} value={listingType} onChange={(value) => updateFilter(setListingType, value)} ariaLabelledBy="listing-type-filter" flush /></div>
            <div className={filterStyles.field}><label htmlFor="district-filter"><MapPin size={15} aria-hidden="true" /> District</label><select id="district-filter" value={district} onChange={(event) => updateFilter(setDistrict, event.target.value)}>{DISTRICT_OPTIONS.map((option) => <option key={option.value || "all"} value={option.value}>{option.label}</option>)}</select></div>
            <div className={filterStyles.prices}>
              <div className={filterStyles.field}><label htmlFor="min-price-filter">Min price (NPR)</label><input id="min-price-filter" type="text" inputMode="numeric" pattern="[0-9]*" value={minPrice} aria-invalid={invalidPriceRange} onChange={(event) => updatePrice("min", event.target.value)} onBlur={() => normalizePriceRange("min")} placeholder="No minimum" /></div>
              <div className={filterStyles.field}><label htmlFor="max-price-filter">Max price (NPR)</label><input id="max-price-filter" type="text" inputMode="numeric" pattern="[0-9]*" value={maxPrice} aria-invalid={invalidPriceRange} onChange={(event) => updatePrice("max", event.target.value)} onBlur={() => normalizePriceRange("max")} placeholder="No maximum" /></div>
              {invalidPriceRange && <small className={filterStyles.rangeError}>Minimum cannot be greater than maximum.</small>}
            </div>
          </div>}
        </section>
        {hasFilters && <div className="active-filters"><strong>{total} result{total === 1 ? "" : "s"}</strong>{query && <button onClick={() => updateFilter(setQuery, "")}>“{query}” <X size={13} /></button>}{selectedCategory && <button onClick={() => updateFilter(setCategoryId, "")}>{selectedCategory.name} <X size={13} /></button>}{listingType && <button onClick={() => updateFilter(setListingType, "")}>{listingType === "PRODUCT" ? "Products" : "Services"} <X size={13} /></button>}{district && <button onClick={() => updateFilter(setDistrict, "")}>{district} <X size={13} /></button>}{minPrice && <button onClick={() => updateFilter(setMinPrice, "")}>From NPR {Number(minPrice).toLocaleString("en-NP")} <X size={13} /></button>}{maxPrice && <button onClick={() => updateFilter(setMaxPrice, "")}>Up to NPR {Number(maxPrice).toLocaleString("en-NP")} <X size={13} /></button>}<button className="clear-filters" onClick={clear}>Clear all</button></div>}
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
