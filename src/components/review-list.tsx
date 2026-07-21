"use client";

import { useEffect, useState } from "react";
import { reviewsApi, type Review } from "@/lib/api/reviews";

// Both the listing page and every profile render this; 50 full review bodies on first
// paint is far more than any of them show above the fold.
const PAGE = 10;

export function ReviewList({ listingId, userId, empty = "No verified reviews yet." }: { listingId?: string; userId?: string; empty?: string }) {
  const [reviews, setReviews] = useState<Review[]>([]); const [total, setTotal] = useState(0); const [size, setSize] = useState(PAGE); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { const request = listingId ? reviewsApi.forListing(listingId, 0, size) : userId ? reviewsApi.forUser(userId, 0, size) : null; if (!request) return; request.then((page) => { setReviews(page.content); setTotal(page.totalElements); }).catch(() => setError("Reviews could not be loaded.")).finally(() => setLoading(false)); }, [listingId, userId, size]);
  if (loading) return <p>Loading reviews…</p>; if (error) return <p>{error}</p>; if (!reviews.length) return <p className="empty-note">{empty}</p>;
  return <div className="profile-reviews">{reviews.map((review) => <article className="card review" key={review.id}><div><span className="avatar">{review.authorName[0]}</span><div><strong>{review.authorName}</strong><p className="rating" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</p></div><time>{new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(review.createdAt))}</time></div>{review.comment && <p>{review.comment}</p>}</article>)}{total > reviews.length && <button className="button button--secondary button--small" onClick={() => setSize(total)}>Show all {total} reviews</button>}</div>;
}
