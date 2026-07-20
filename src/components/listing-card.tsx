import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Building2, MapPin, Star, UserRound } from "lucide-react";
import { formatNpr } from "@/lib/format";
import { assetUrl } from "@/lib/api/assets";
import { priceUnitLabel, type ListingSummary } from "@/lib/api/listings";
import { FavoriteHeart } from "./favorite-heart";
import styles from "./listing-card.module.css";

type ListingCardProps = {
  listing: ListingSummary;
  priority?: boolean;
  hideFavorite?: boolean;
  compact?: boolean;
  actions?: ReactNode;
};

export function ListingCard({ listing, priority = false, hideFavorite = false, compact = false, actions }: ListingCardProps) {
  const href = `/listing/${listing.id}`;
  const image = assetUrl(listing.coverImage);
  const type = listing.type === "PRODUCT" ? "Product" : "Service";
  return (
    <article className={compact ? `${styles.card} ${styles.compact}` : styles.card}>
      {image && <span className="listing-card__ambient" style={{ backgroundImage: `url("${image}")` }} aria-hidden="true" />}
      <Link className="listing-card__image" href={href} aria-label={`View ${listing.title}`}>
        {image ? <Image src={image} alt={listing.title} fill sizes="(max-width: 700px) 100vw, (max-width: 1024px) 50vw, 33vw" loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} /> : <span className="listing-card__placeholder">No photo yet</span>}
        <span className={`type-chip type-chip--${type.toLowerCase()}`}>{type}</span>
      </Link>
      {!hideFavorite && <FavoriteHeart listingId={listing.id} title={listing.title} />}
      <div className="listing-card__body">
        <div className="listing-card__eyebrow">
          <span><MapPin size={14} /> {listing.district}</span>
          {listing.reviewCount ? <span className="rating"><Star size={14} fill="currentColor" /> {(listing.averageRating ?? 0).toFixed(1)} <small>({listing.reviewCount})</small></span> : <span className="rating rating--new">New</span>}
        </div>
        <h3><Link href={href}>{listing.title}</Link></h3>
        {listing.provider && <p className="listing-card__provider">{listing.provider.type === "ORG" ? <Building2 size={13} /> : <UserRound size={13} />} {listing.provider.name}</p>}
        <p className="price"><strong>{formatNpr(listing.pricePerUnit)}</strong> / {priceUnitLabel(listing.priceUnit)}</p>
        {actions && <div className="listing-card__actions">{actions}</div>}
      </div>
    </article>
  );
}
