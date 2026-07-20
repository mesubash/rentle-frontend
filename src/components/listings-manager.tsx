"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { PageBackLink } from "./page-back-link";
import { ListingCard } from "./listing-card";
import { ListingPagination } from "./listing-pagination";
import { listingsApi, type ListingSummary } from "@/lib/api/listings";
import styles from "./listings-manager.module.css";

export function ListingsManager() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageParam = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const currentPage = !Number.isFinite(pageParam) || pageParam < 1 ? 0 : pageParam - 1;
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pageSize = 12;

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError("");
      listingsApi.mine(currentPage, pageSize)
        .then((page) => { if (active) { setListings(page.content); setTotal(page.totalElements); setTotalPages(page.totalPages); } })
        .catch(() => { if (active) setError("Your listings could not be loaded."); })
        .finally(() => { if (active) setLoading(false); });
    }, 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, [currentPage]);

  function goToPage(page: number) {
    if (loading || page === currentPage || page < 0 || page >= totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    if (page === 0) params.delete("page");
    else params.set("page", String(page + 1));
    router.push(`${pathname}${params.size ? `?${params.toString()}` : ""}`, { scroll: false });
    document.getElementById("managed-listings")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return <main className="page"><div className="container">
    <PageBackLink href="/profile">Back to profile</PageBackLink>
    <header className={styles.header}>
      <div><p className="eyebrow">Owner workspace</p><h1>Manage listings</h1><p>Update availability, pricing, photos, and publishing status.</p></div>
      <Link className={`button button--small ${styles.createButton}`} href="/list"><Plus size={17} /><span>Create listing</span></Link>
    </header>

    <div id="managed-listings" className={styles.anchor} />
    {loading ? <div className={styles.grid}>{[1, 2, 3, 4].map((item) => <div className="skeleton" key={item} />)}</div>
      : error ? <section className="empty-state"><h2>Could not load listings</h2><p>{error}</p></section>
      : listings.length ? <div className={styles.grid}>{listings.map((listing, index) => <ListingCard key={listing.id} listing={listing} compact hideFavorite priority={index < 4} actions={<Link className="button button--small button--wide" href={`/listings/manage/${listing.id}`}>Manage listing</Link>} />)}</div>
      : <section className="empty-state"><h2>You have no listings yet.</h2><p>Create one with real details and current photos.</p><Link className="button" href="/list">Create your first listing</Link></section>}
    {!loading && !error && listings.length > 0 && <ListingPagination currentPage={currentPage} totalPages={totalPages} total={total} count={listings.length} pageSize={pageSize} onChange={goToPage} />}
  </div></main>;
}
