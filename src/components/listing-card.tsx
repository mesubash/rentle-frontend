import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Star } from "lucide-react";
import { formatNpr } from "@/lib/format";
import { assetUrl } from "@/lib/api/assets";
import { priceUnitLabel, type ListingSummary } from "@/lib/api/listings";

export function ListingCard({ listing, priority = false }: { listing: ListingSummary; priority?: boolean }) {
  const href = `/listing/${listing.id}`;
  const image = assetUrl(listing.coverImage);
  const type = listing.type === "PRODUCT" ? "Product" : "Service";
  return (
    <article className="listing-card">
      <Link className="listing-card__image" href={href} aria-label={`View ${listing.title}`}>
        {image ? <Image src={image} alt={listing.title} fill sizes="(max-width: 700px) 100vw, (max-width: 1024px) 50vw, 33vw" priority={priority} /> : <span className="listing-card__placeholder">No photo yet</span>}
        <span className={`type-chip type-chip--${type.toLowerCase()}`}>{type}</span>
        <span className="icon-button icon-button--photo" aria-hidden="true"><Heart size={18} /></span>
      </Link>
      <div className="listing-card__body">
        <div className="listing-card__eyebrow">
          <span><MapPin size={14} /> {listing.district}</span>
          {listing.reviewCount ? <span className="rating"><Star size={14} fill="currentColor" /> {(listing.averageRating ?? 0).toFixed(1)} <small>({listing.reviewCount})</small></span> : <span className="rating rating--new">New</span>}
        </div>
        <h3><Link href={href}>{listing.title}</Link></h3>
        <p className="price"><strong>{formatNpr(listing.pricePerUnit)}</strong> / {priceUnitLabel(listing.priceUnit)}</p>
      </div>
    </article>
  );
}
