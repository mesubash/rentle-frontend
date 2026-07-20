"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock3, ImageOff, MapPin, MessageCircle, ShieldCheck, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { AvailabilityCalendar } from "./availability-calendar";
import { BookingPanel } from "./booking-panel";
import { SiteFooter } from "./site-footer";
import { TrustBadge } from "./trust-badge";
import { ReportButton } from "./report-button";
import { ReviewList } from "./review-list";
import { ShareListingButton } from "./share-listing-button";
import { assetUrl } from "@/lib/api/assets";
import { ApiError } from "@/lib/api/client";
import { listingsApi, type ListingDetail } from "@/lib/api/listings";

export function ListingDetailView({ listingId }: { listingId: string }) {
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    listingsApi.detail(listingId).then((value) => active && setListing(value)).catch((caught) => active && setError(caught instanceof ApiError ? caught.message : "This listing could not be loaded."));
    return () => { active = false; };
  }, [attempt, listingId]);

  if (!listing && !error) return <main className="page"><div className="container"><div className="skeleton" /></div></main>;
  if (!listing) return <main className="page"><div className="container narrow-page"><section className="empty-state"><p className="eyebrow">Listing unavailable</p><h1>We could not open this listing.</h1><p>{error}</p><button className="button" onClick={() => { setError(""); setAttempt((value) => value + 1); }}>Try again</button></section></div></main>;

  const images = listing.images.map(assetUrl).filter((value): value is string => Boolean(value));
  const type = listing.type === "PRODUCT" ? "Product" : "Service";
  const joined = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(listing.owner.memberSince));

  return <><main className="page listing-detail-page"><div className="container">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/explore">Explore</Link><span>/</span><span>{listing.categoryName}</span></nav>
    {images.length ? <div className="gallery">{images.map((image, index) => <div key={image} className={index === 0 ? "gallery__main" : "gallery__thumb"}><Image src={image} alt={`${listing.title}${index ? ` photo ${index + 1}` : ""}`} fill sizes={index === 0 ? "(max-width: 800px) 100vw, 60vw" : "25vw"} priority={index === 0} /></div>)}</div> : <div className="gallery-empty"><ImageOff size={22} /><span>No photos added yet</span></div>}
    <div className="listing-detail-layout"><article className="listing-content">
      <div className="listing-title-row"><div><div className="listing-title-row__meta"><span className={`type-chip type-chip--${type.toLowerCase()}`}>{type}</span><span><MapPin size={15} /> {listing.locationText ? `${listing.locationText}, ` : ""}{listing.district}</span></div><h1>{listing.title}</h1><p className="listing-subline"><span className="rating"><Star size={16} fill="currentColor" /> {listing.reviewCount ? `${(listing.averageRating ?? 0).toFixed(1)} (${listing.reviewCount} reviews)` : "No reviews yet"}</span><TrustBadge verified={listing.owner.verified} /></p></div><ShareListingButton listingId={listing.id} title={listing.title} /></div>
      <section className="detail-section listing-overview"><h2>About this {listing.type === "SERVICE" ? "service" : "item"}</h2><p>{listing.description}</p>{listing.rentalTerms && <div className="listing-terms"><h3>Rental terms</h3><p>{listing.rentalTerms}</p></div>}<div className="spec-grid">{listing.product ? <><div><small>Condition</small><strong>{humanize(listing.product.condition)}</strong></div><div><small>Brand</small><strong>{listing.product.brand || "Not specified"}</strong></div><div><small>Model</small><strong>{listing.product.model || "Not specified"}</strong></div><div><small>Rental period</small><strong>{listing.product.minRentalDays || 1}{listing.product.maxRentalDays ? `–${listing.product.maxRentalDays}` : "+"} days</strong></div></> : <><div><Clock3 /><small>Minimum notice</small><strong>{listing.service?.minNoticeHours ?? 0} hours</strong></div><div><MapPin /><small>Service area</small><strong>{listing.service?.serviceAreaKm ? `${listing.service.serviceAreaKm} km` : listing.district}</strong></div><div><CalendarDays /><small>Typical duration</small><strong>{humanize(listing.service?.typicalDuration || "CUSTOM")}</strong></div><div><small>Portfolio</small><strong>{listing.service?.portfolioUrl ? <a href={listing.service.portfolioUrl}>Open link</a> : "Not provided"}</strong></div></>}</div></section>
      <div className="listing-support-grid">
        <section className="availability-section"><div className="compact-section-heading"><div><p className="eyebrow">Plan your dates</p><h2>Availability</h2></div><p>Green dates can be requested.</p></div><AvailabilityCalendar listingId={listing.id} /></section>
        <section className="owner-card"><div className="owner-card__head"><span className="avatar avatar--large">{initials(listing.owner.businessName || listing.owner.fullName)}</span><div><p className="eyebrow">Hosted by</p><h2>{listing.provider?.type === "ORG" ? listing.provider.name : (listing.owner.businessName || listing.owner.fullName)}</h2><div className="owner-card__badges"><TrustBadge verified={listing.owner.verified} />{(listing.provider?.type === "ORG" || listing.owner.accountType === "BUSINESS") && <span className="business-badge"><ShieldCheck size={13} /> {listing.provider?.type === "ORG" ? "Organization" : "Registered business"}</span>}</div></div></div><dl><div><dt>Trust score</dt><dd>{formatTrustScore(listing.owner.trustScore)}</dd></div><div><dt>Reviews</dt><dd>{listing.reviewCount}</dd></div><div><dt>Member since</dt><dd>{joined}</dd></div><div><dt>Bookings</dt><dd>{listing.totalBookings}</dd></div></dl><Link className="button button--secondary button--small" href={`/profile/${listing.owner.id}`}><MessageCircle size={16} /> View profile</Link></section>
      </div>
      <section className="detail-section reviews"><div className="section-heading"><h2>Reviews from completed bookings</h2>{listing.reviewCount ? <span className="rating"><Star size={16} fill="currentColor" /> {(listing.averageRating ?? 0).toFixed(1)}</span> : null}</div><ReviewList listingId={listing.id} /></section>
      <div className="listing-report"><ReportButton targetType="LISTING" targetId={listing.id} label="Report this listing" /></div>
    </article><div className="booking-column"><BookingPanel listing={listing} /></div></div>
  </div></main><SiteFooter /></>;
}

function initials(name: string) { return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); }
function humanize(value: string) { return value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase()); }
function formatTrustScore(value: number | null | undefined) { return value && value > 0 ? `${value.toFixed(1)} / 5` : "No reviews yet"; }
