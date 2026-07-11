import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Star } from "lucide-react";
import { formatNpr, type Listing } from "@/lib/data";
import { TrustBadge } from "./trust-badge";

export function ListingCard({ listing, priority = false }: { listing: Listing; priority?: boolean }) {
  return (
    <article className="listing-card">
      <Link className="listing-card__image" href={`/listing/${listing.slug}`} aria-label={`View ${listing.title}`}>
        <Image src={listing.image} alt={listing.alt} fill sizes="(max-width: 700px) 100vw, (max-width: 1024px) 50vw, 33vw" priority={priority} />
        <span className={`type-chip type-chip--${listing.type.toLowerCase()}`}>{listing.type}</span>
        <span className="icon-button icon-button--photo" aria-hidden="true"><Heart size={18} /></span>
      </Link>
      <div className="listing-card__body">
        <div className="listing-card__eyebrow">
          <span><MapPin size={14} /> {listing.area}, {listing.district}</span>
          <span className="rating"><Star size={14} fill="currentColor" /> {listing.rating} <small>({listing.reviewCount})</small></span>
        </div>
        <h3><Link href={`/listing/${listing.slug}`}>{listing.title}</Link></h3>
        <div className="listing-card__owner"><span>{listing.owner}</span><TrustBadge compact /></div>
        <p className="price"><strong>{formatNpr(listing.price)}</strong> / {listing.unit}</p>
      </div>
    </article>
  );
}
