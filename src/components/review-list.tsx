"use client";

import { useEffect, useState } from "react";
import { reviewsApi, type Review } from "@/lib/api/reviews";

export function ReviewList({ listingId, userId, empty = "No verified reviews yet." }: { listingId?: string; userId?: string; empty?: string }) {
  const [reviews, setReviews] = useState<Review[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { const request = listingId ? reviewsApi.forListing(listingId, 0, 50) : userId ? reviewsApi.forUser(userId, 0, 50) : null; if (!request) return; request.then((page) => setReviews(page.content)).catch(() => setError("Reviews could not be loaded.")).finally(() => setLoading(false)); }, [listingId, userId]);
  if (loading) return <p>Loading reviews…</p>; if (error) return <p>{error}</p>; if (!reviews.length) return <p className="empty-note">{empty}</p>;
  return <div className="profile-reviews">{reviews.map((review) => <article className="card review" key={review.id}><div><span className="avatar">{review.authorName[0]}</span><div><strong>{review.authorName}</strong><p className="rating" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</p></div><time>{new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(review.createdAt))}</time></div>{review.comment && <p>{review.comment}</p>}</article>)}</div>;
}
