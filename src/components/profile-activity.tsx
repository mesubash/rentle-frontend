"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { ListingCard } from "./listing-card";
import { ReviewList } from "./review-list";
import { listingsApi, type ListingSummary } from "@/lib/api/listings";
import styles from "./profile-activity.module.css";

export function ProfileActivity({ userId, own }: { userId: string; own: boolean }) {
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const previewSize = own ? 4 : 8;

  useEffect(() => {
    let active = true;
    listingsApi.byUser(userId, 0, previewSize)
      .then((page) => { if (active) { setListings(page.content); setTotal(page.totalElements); } })
      .catch(() => { if (active) setError("Listings could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [previewSize, userId]);

  return <>
    <section className={styles.section}>
      <div className={styles.heading}><h2>Listings</h2>{own && <Link className={`button button--small ${styles.addButton}`} href="/list"><Plus size={16} /><span>Add listing</span></Link>}</div>
      {loading ? <div className={styles.grid}>{[1, 2, 3, 4].map((item) => <div className="skeleton" key={item} />)}</div>
        : error ? <div className="inline-notice" role="status">{error}</div>
        : listings.length ? <><div className={styles.grid}>{listings.map((listing, index) => <ListingCard listing={listing} key={listing.id} compact hideFavorite={own} priority={index < 2} />)}</div>{own && <div className={styles.more}><Link className={styles.moreLink} href="/listings/manage">View all {total} listing{total === 1 ? "" : "s"} & manage <ArrowRight size={16} /></Link></div>}</>
        : <p className="empty-note">No active listings yet.</p>}
    </section>
    <section className="profile-section"><h2>Reviews</h2><ReviewList userId={userId} /></section>
  </>;
}
