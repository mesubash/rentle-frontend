"use client";

import { useState } from "react";
import { CheckCircle2, Star } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import { reviewsApi } from "@/lib/api/reviews";

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const [rating, setRating] = useState(0); const [comment, setComment] = useState(""); const [submitting, setSubmitting] = useState(false); const [submitted, setSubmitted] = useState(false); const [error, setError] = useState("");
  async function submit() { setSubmitting(true); setError(""); try { await reviewsApi.create(bookingId, rating, comment.trim() || undefined); setSubmitted(true); } catch (caught) { setError(caught instanceof ApiError ? caught.message : "Your review could not be submitted."); } finally { setSubmitting(false); } }
  if (submitted) return <section className="card booking-action-card"><CheckCircle2 className="state-icon state-icon--success" size={30} /><p className="eyebrow">Review submitted</p><h2>Thank you for being specific.</h2><p>Your verified review is now attached to this completed booking.</p></section>;
  return <section className="card booking-action-card"><p className="eyebrow">Completed booking</p><h2>How was the experience?</h2><p>Review communication, condition, timing, and handover—not the person’s identity or background.</p><fieldset className="rating-input"><legend>Overall rating</legend><div>{[1,2,3,4,5].map((value) => <button type="button" key={value} aria-label={`${value} star${value === 1 ? "" : "s"}`} onClick={() => setRating(value)}><Star fill={value <= rating ? "currentColor" : "none"} /></button>)}</div></fieldset><div className="field"><label htmlFor="review-comment">Public review (optional)</label><textarea id="review-comment" maxLength={500} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Pickup was clear and the item matched its description." /></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="button" disabled={!rating || submitting} onClick={submit}>{submitting ? "Submitting…" : "Submit review"}</button></section>;
}
