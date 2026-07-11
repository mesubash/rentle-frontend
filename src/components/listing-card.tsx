import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Star } from "lucide-react";
import { formatNpr, type Listing } from "@/lib/data";
import { assetUrl } from "@/lib/api/assets";
import { priceUnitLabel, type ListingSummary } from "@/lib/api/listings";
import { TrustBadge } from "./trust-badge";

export function ListingCard({ listing, priority = false }: { listing: Listing | ListingSummary; priority?: boolean }) {
  const remote = "id" in listing;
  const href = `/listing/${remote ? listing.id : listing.slug}`;
  const image = remote ? assetUrl(listing.coverImage) : listing.image;
  const type = remote ? (listing.type === "PRODUCT" ? "Product" : "Service") : listing.type;
  const price = remote ? listing.pricePerUnit : listing.price;
  const unit = remote ? priceUnitLabel(listing.priceUnit) : listing.unit;
  const location = remote ? listing.district : `${listing.area}, ${listing.district}`;
  const rating = remote ? listing.averageRating : listing.rating;
  return (
    <article className="listing-card">
      <Link className="listing-card__image" href={href} aria-label={`View ${listing.title}`}>
        {image ? <Image src={image} alt={remote ? listing.title : listing.alt} fill sizes="(max-width: 700px) 100vw, (max-width: 1024px) 50vw, 33vw" priority={priority} /> : <span className="listing-card__placeholder">No photo yet</span>}
        <span className={`type-chip type-chip--${type.toLowerCase()}`}>{type}</span>
        <span className="icon-button icon-button--photo" aria-hidden="true"><Heart size={18} /></span>
      </Link>
      <div className="listing-card__body">
        <div className="listing-card__eyebrow">
          <span><MapPin size={14} /> {location}</span>
          <span className="rating"><Star size={14} fill="currentColor" /> {rating} <small>({listing.reviewCount})</small></span>
        </div>
        <h3><Link href={href}>{listing.title}</Link></h3>
        {!remote && <div className="listing-card__owner"><span>{listing.owner}</span><TrustBadge compact /></div>}
        <p className="price"><strong>{formatNpr(price)}</strong> / {unit}</p>
      </div>
    </article>
  );
}
