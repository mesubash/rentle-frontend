"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import type { ListingType } from "@/lib/api/listings";
import { DISTRICT_OPTIONS } from "@/lib/districts";
import styles from "./explore-filters.module.css";

type SortValue = "newest" | "rating" | "price_asc" | "price_desc";

export function MarketplaceFilterBar({
  listingType,
  district,
  minPrice,
  maxPrice,
  sort,
  onTypeChange,
  onDistrictChange,
  onPriceChange,
  onSortChange,
  onClear,
  showClear = false,
}: {
  listingType: ListingType | "";
  district: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
  onTypeChange: (value: ListingType | "") => void;
  onDistrictChange: (value: string) => void;
  onPriceChange: (min: string, max: string) => void;
  onSortChange: (value: SortValue) => void;
  onClear: () => void;
  showClear?: boolean;
}) {
  const [priceOpen, setPriceOpen] = useState(false);
  const [draftMin, setDraftMin] = useState(minPrice);
  const [draftMax, setDraftMax] = useState(maxPrice);
  const priceRef = useRef<HTMLDivElement | null>(null);
  const invalidRange = Boolean(draftMin && draftMax && Number(draftMin) > Number(draftMax));

  useEffect(() => {
    if (!priceOpen) return;
    const close = (event: PointerEvent) => {
      if (!priceRef.current?.contains(event.target as Node)) setPriceOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPriceOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [priceOpen]);

  function priceInput(value: string) {
    return value.replace(/\D/g, "").slice(0, 9);
  }

  function applyPrice() {
    if (invalidRange) return;
    onPriceChange(draftMin, draftMax);
    setPriceOpen(false);
  }

  function openPrice() {
    if (priceOpen) return;
    setDraftMin(minPrice);
    setDraftMax(maxPrice);
    setPriceOpen(true);
  }

  function clearPrice() {
    setDraftMin("");
    setDraftMax("");
    onPriceChange("", "");
    setPriceOpen(false);
  }

  return <section className={styles.bar} aria-label="Listing filters">
    <div className={styles.rail}>
      <div className={styles.title}><span><SlidersHorizontal size={16} /></span><strong>Filters</strong></div>
      <MenuFilter label="Type" value={listingType} active={Boolean(listingType)} onChange={(value) => onTypeChange(value as ListingType | "")} options={[{ value: "", label: "All" }, { value: "PRODUCT", label: "Products" }, { value: "SERVICE", label: "Services" }]} />
      <MenuFilter label="Location" value={district} active={Boolean(district)} onChange={onDistrictChange} options={DISTRICT_OPTIONS} />
      <div className={styles.price} ref={priceRef} onMouseEnter={openPrice} onMouseLeave={() => setPriceOpen(false)}>
        <button type="button" className={`${styles.control} ${minPrice || maxPrice ? styles.active : ""}`} aria-expanded={priceOpen} aria-controls="marketplace-price-panel" onClick={openPrice}><span>Price:</span><strong>{priceLabel(minPrice, maxPrice)}</strong><ChevronDown size={14} /></button>
        {priceOpen && <div className={styles.pricePanel} id="marketplace-price-panel">
          <div className={styles.panelHead}><strong>Price range</strong><button type="button" aria-label="Close price filter" onClick={() => setPriceOpen(false)}><X size={17} /></button></div>
          <div className={styles.priceFields}><label>Minimum (NPR)<input autoFocus inputMode="numeric" pattern="[0-9]*" value={draftMin} aria-invalid={invalidRange} onChange={(event) => setDraftMin(priceInput(event.target.value))} placeholder="No minimum" /></label><label>Maximum (NPR)<input inputMode="numeric" pattern="[0-9]*" value={draftMax} aria-invalid={invalidRange} onChange={(event) => setDraftMax(priceInput(event.target.value))} placeholder="No maximum" /></label></div>
          {invalidRange && <small className={styles.error}>Minimum cannot exceed maximum.</small>}
          <div className={styles.panelActions}><button type="button" className={styles.clear} onClick={clearPrice}>Clear</button><button type="button" className="button button--small" disabled={invalidRange} onClick={applyPrice}>Apply price</button></div>
        </div>}
      </div>
      {showClear && <button type="button" className={styles.clearAll} onClick={onClear}><X size={14} />Clear</button>}
      <span className={styles.spacer} />
      <MenuFilter label="Sort" value={sort} onChange={(value) => onSortChange(value as SortValue)} options={[{ value: "newest", label: "Newest" }, { value: "rating", label: "Highest rated" }, { value: "price_asc", label: "Price: low to high" }, { value: "price_desc", label: "Price: high to low" }]} sort />
    </div>
  </section>;
}

function MenuFilter({ label, value, options, onChange, active = false, sort = false }: { label: string; value: string; options: readonly { value: string; label: string }[]; onChange: (value: string) => void; active?: boolean; sort?: boolean }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value) ?? options[0];
  return <div
    className={`${styles.menuRoot} ${sort ? styles.sortRoot : ""}`}
    onMouseEnter={() => setOpen(true)}
    onMouseLeave={() => setOpen(false)}
    onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
  >
    <button type="button" className={`${styles.control} ${active ? styles.active : ""} ${sort ? styles.sort : ""}`} aria-label={`${label} filter, ${selected.label}`} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(true)}><span>{label}:</span><strong>{selected.label}</strong><ChevronDown size={14} /></button>
    {open && <div className={styles.menu} role="menu" aria-label={`${label} options`}>{options.map((option) => <button type="button" role="menuitemradio" aria-checked={option.value === value} className={option.value === value ? styles.selected : ""} key={option.value || "all"} onClick={() => { onChange(option.value); setOpen(false); }}><span>{option.label}</span>{option.value === value && <Check size={15} />}</button>)}</div>}
  </div>;
}

function priceLabel(min: string, max: string) {
  if (!min && !max) return "Any";
  if (min && max) return `${compactPrice(min)}–${compactPrice(max)} NPR`;
  return min ? `From ${compactPrice(min)}` : `Up to ${compactPrice(max)}`;
}

function compactPrice(value: string) {
  const amount = Number(value);
  if (amount >= 1000 && amount % 1000 === 0) return `${amount / 1000}k`;
  return amount.toLocaleString("en-NP");
}
