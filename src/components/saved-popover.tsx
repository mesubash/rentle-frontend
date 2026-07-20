"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, MapPin, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { assetUrl } from "@/lib/api/assets";
import { favoritesApi } from "@/lib/api/favorites";
import { priceUnitLabel, type ListingSummary } from "@/lib/api/listings";
import { formatNpr } from "@/lib/format";
import { useFavorites } from "./favorites-provider";

type SavedPopoverProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SavedPopover({ open, onOpenChange }: SavedPopoverProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { savedCount, toggle, ready } = useFavorites();
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let active = true;
    favoritesApi
      .list()
      .then((items) => {
        if (active) {
          setListings(items);
          setError("");
        }
      })
      .catch(() => {
        if (active) setError("Saved listings could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) onOpenChange(false);
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      active = false;
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onOpenChange, open]);

  const remove = async (listing: ListingSummary) => {
    if (removingId) return;
    setRemovingId(listing.id);
    setError("");
    try {
      const removed = await toggle(listing.id);
      if (removed) {
        setListings((current) => current.filter((item) => item.id !== listing.id));
      } else {
        setError("That listing could not be removed from Saved.");
      }
    } catch {
      setError("That listing could not be removed from Saved.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="saved-popover-root" ref={rootRef}>
      <button
        type="button"
        className="icon-button header-saved header-expandable"
        aria-label={savedCount > 0 ? `Saved listings, ${savedCount} items` : "Saved listings"}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        onPointerUp={(event) => event.currentTarget.blur()}
      >
        <Heart size={19} fill={savedCount > 0 ? "currentColor" : "none"} />
        <span className="header-action-label">Saved</span>
        {ready && savedCount > 0 && (
          <span className="nav-badge" aria-hidden="true">{savedCount > 99 ? "99+" : savedCount}</span>
        )}
      </button>

      {open && (
        <section className="saved-popover" role="dialog" aria-labelledby="saved-popover-title">
          <header>
            <div>
              <h2 id="saved-popover-title">Saved</h2>
              <span>{savedCount > 0 ? `${savedCount} ${savedCount === 1 ? "listing" : "listings"}` : "Keep good finds close"}</span>
            </div>
            <button type="button" className="icon-button saved-popover__close" aria-label="Close saved listings" onClick={() => onOpenChange(false)}>
              <X size={18} />
            </button>
          </header>

          {error && <p className="saved-popover__error" role="alert">{error}</p>}

          <div className="saved-popover__body">
            {loading ? (
              <div className="saved-popover__status" role="status">
                <Heart size={22} />
                <p>Loading saved listings…</p>
              </div>
            ) : listings.length ? (
              <div className="saved-popover__list">
                {listings.slice(0, 6).map((listing) => {
                  const image = assetUrl(listing.coverImage);
                  return (
                    <article className="saved-popover__item" key={listing.id}>
                      <Link className="saved-popover__image" href={`/listing/${listing.id}`} onClick={() => onOpenChange(false)} aria-label={`View ${listing.title}`}>
                        {image ? (
                          <Image src={image} alt="" fill sizes="64px" />
                        ) : (
                          <Heart size={18} aria-hidden="true" />
                        )}
                      </Link>
                      <div className="saved-popover__copy">
                        <Link href={`/listing/${listing.id}`} onClick={() => onOpenChange(false)}>{listing.title}</Link>
                        <span><MapPin size={12} /> {listing.district}</span>
                        <strong>{formatNpr(listing.pricePerUnit)} <small>/ {priceUnitLabel(listing.priceUnit)}</small></strong>
                      </div>
                      <button
                        type="button"
                        className="icon-button saved-popover__remove"
                        aria-label={`Remove ${listing.title} from saved`}
                        disabled={removingId === listing.id}
                        onClick={() => void remove(listing)}
                      >
                        <Heart size={17} fill="currentColor" />
                      </button>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="saved-popover__status">
                <Heart size={25} />
                <h3>Nothing saved yet</h3>
                <p>Tap the heart on a listing to keep it here.</p>
                <Link href="/explore" onClick={() => onOpenChange(false)}>Browse listings <ArrowRight size={14} /></Link>
              </div>
            )}
          </div>

          {listings.length > 0 && (
            <footer>
              <Link href="/favorites" onClick={() => onOpenChange(false)}>
                View all saved <ArrowRight size={15} />
              </Link>
            </footer>
          )}
        </section>
      )}
    </div>
  );
}
