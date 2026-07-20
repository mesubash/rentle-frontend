"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "./favorites-provider";

/** Heart toggle on a listing card. Client island inside the (server) ListingCard. */
export function FavoriteHeart({ listingId, title }: { listingId: string; title: string }) {
  const { isSaved, toggle } = useFavorites();
  const active = isSaved(listingId);
  return (
    <button
      type="button"
      className={active ? "listing-card__fav is-active" : "listing-card__fav"}
      aria-pressed={active}
      aria-label={active ? `Remove ${title} from saved` : `Save ${title}`}
      onClick={(event) => { event.preventDefault(); event.stopPropagation(); void toggle(listingId); }}
    >
      <Heart size={18} />
    </button>
  );
}
