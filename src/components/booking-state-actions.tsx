"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, MessageCircle, Star, XCircle } from "lucide-react";

export function AwaitingApprovalAction({ owner }: { owner: string }) {
  const [cancelled, setCancelled] = useState(false);
  const [confirming, setConfirming] = useState(false);
  if (cancelled) return <section className="card booking-action-card"><XCircle className="state-icon state-icon--declined" size={30} /><p className="eyebrow">Request cancelled</p><h2>Your dates are released.</h2><p>{owner} was notified. No deposit was due and no payment was recorded.</p><Link className="button button--secondary" href="/explore">Find another listing</Link></section>;
  return <section className="card booking-action-card"><CheckCircle2 className="state-icon state-icon--success" size={30} /><p className="eyebrow">Request sent</p><h2>Waiting for {owner}.</h2><p>Your dates and note are saved. {owner} usually responds within two hours. Deposit instructions and booking messages open only after approval.</p>{confirming ? <div className="decline-form"><div className="form-note"><XCircle size={17} /><span>Cancel this request? The dates will be released immediately.</span></div><div className="button-row"><button className="button button--danger" onClick={() => setCancelled(true)}>Yes, cancel request</button><button className="button button--secondary" onClick={() => setConfirming(false)}>Keep request</button></div></div> : <button className="button button--danger" onClick={() => setConfirming(true)}>Cancel request</button>}</section>;
}

export function ConfirmDepositAction({ renter }: { renter: string }) {
  const [confirmed, setConfirmed] = useState(false);
  const [proofOpen, setProofOpen] = useState(false);
  if (confirmed) return <section className="card booking-action-card"><CheckCircle2 className="state-icon state-icon--success" size={30} /><p className="eyebrow">Booking activated</p><h2>Deposit receipt confirmed.</h2><p>{renter} was notified. The booking is active and the handover can proceed on the agreed date.</p><div className="inline-success"><CheckCircle2 size={18} /><span>Status changed from Deposit pending to Active.</span></div></section>;
  return <section className="card booking-action-card"><p className="eyebrow">Your next step</p><h2>Confirm the deposit arrived</h2><p>{renter} uploaded payment proof for the agreed <strong>NPR 25,000</strong> deposit. Check your eSewa or Khalti balance before confirming.</p><div className="payment-proof card"><div><strong>eSewa payment screenshot</strong><small>Uploaded today · 11:24am · JPG</small></div><button className="button button--secondary button--small" onClick={() => setProofOpen(true)}>View proof</button></div>{proofOpen && <div className="proof-preview"><div><strong>eSewa transfer · NPR 25,000</strong><small>Reference 8J4K••92 · uploaded 11:24am</small></div><button className="icon-button" aria-label="Close proof" onClick={() => setProofOpen(false)}><XCircle /></button></div>}<div className="form-note"><ShieldCheckInline /><span>Only confirm money you can see in your own wallet. A screenshot alone is not proof of receipt.</span></div><button className="button button--wide" onClick={() => setConfirmed(true)}><CheckCircle2 size={17} /> Confirm deposit received</button></section>;
}

function ShieldCheckInline() { return <CheckCircle2 size={18} />; }

export function ActiveBookingAction({ counterpart }: { counterpart: string }) {
  const [confirming, setConfirming] = useState(false);
  const [complete, setComplete] = useState(false);
  if (complete) return <ReviewBookingAction />;
  return <section className="card booking-action-card"><p className="eyebrow">Booking active</p><h2>Handover is on record.</h2><p>The deposit is confirmed. Keep pickup, return condition, and any timing changes in booking messages.</p><div className="active-facts"><p><CheckCircle2 /> Deposit received and confirmed</p><p><CheckCircle2 /> Booking messages open with {counterpart}</p></div>{confirming ? <div className="decline-form"><div className="form-note"><CheckCircle2 size={18} /><span>Mark complete only after the item or service has been returned or delivered.</span></div><div className="button-row"><button className="button" onClick={() => setComplete(true)}>Yes, mark complete</button><button className="button button--secondary" onClick={() => setConfirming(false)}>Not yet</button></div></div> : <button className="button" onClick={() => setConfirming(true)}>Mark booking complete</button>}</section>;
}

export function OwnerRequestActions({ bookingId }: { bookingId: string }) {
  const [decision, setDecision] = useState<"approved" | "declined" | null>(null);
  const [showDecline, setShowDecline] = useState(false);
  const [reason, setReason] = useState("");

  if (decision) return <section className="card booking-action-card"><CheckCircle2 className={decision === "approved" ? "state-icon state-icon--success" : "state-icon state-icon--declined"} size={30} /><p className="eyebrow">Decision recorded</p><h2>Request {decision}</h2><p>{decision === "approved" ? "Nabin can now send the agreed deposit. A booking message thread is open for handover details." : "Nabin was notified with your reason. These dates are available again."}</p>{decision === "approved" && <Link className="button button--secondary" href={`/messages/${bookingId}`}><MessageCircle size={17} /> Message Nabin</Link>}</section>;

  return <section className="card booking-action-card"><p className="eyebrow">Your next step</p><h2>Approve or decline the dates</h2><p>Nabin requested the Canon EOS R5 for <strong>24–26 August</strong>. Confirm that the item and pickup time work before opening the deposit step.</p><div className="request-summary"><div><small>Rental earnings</small><strong>NPR 4,500</strong></div><div><small>Refundable deposit</small><strong>NPR 25,000</strong></div><div><small>Pickup requested</small><strong>24 Aug · 9:00am</strong></div></div>{showDecline ? <div className="decline-form"><div className="field"><label htmlFor="decline-reason">Reason for declining</label><textarea id="decline-reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Tell Nabin what did not work. Their request details will remain saved." /></div><div className="button-row"><button className="button button--danger" disabled={!reason.trim()} onClick={() => setDecision("declined")}>Confirm decline</button><button className="button button--secondary" onClick={() => setShowDecline(false)}>Go back</button></div></div> : <div className="split-actions"><button className="button button--danger" onClick={() => setShowDecline(true)}><XCircle size={17} /> Decline</button><button className="button" onClick={() => setDecision("approved")}><CheckCircle2 size={17} /> Approve request</button></div>}</section>;
}

export function ReviewBookingAction({ alreadyReviewed = false }: { alreadyReviewed?: boolean }) {
  const [rating, setRating] = useState(alreadyReviewed ? 5 : 0);
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(alreadyReviewed);

  if (submitted) return <section className="card booking-action-card"><CheckCircle2 className="state-icon state-icon--success" size={30} /><p className="eyebrow">Review submitted</p><h2>Your side is complete.</h2><p>Your review is hidden until the other person submits theirs or the 30-day window closes.</p><div className="submitted-rating">{Array.from({ length: 5 }).map((_, index) => <Star key={index} size={21} fill={index < rating ? "currentColor" : "none"} />)}</div></section>;

  return <section className="card booking-action-card"><p className="eyebrow">Completed booking</p><h2>How was the experience?</h2><p>Reviews can only come from completed bookings. Be specific about communication, condition, and timing.</p><fieldset className="rating-input"><legend>Overall rating</legend><div>{Array.from({ length: 5 }).map((_, index) => <button key={index} aria-label={`${index + 1} star${index ? "s" : ""}`} onClick={() => setRating(index + 1)}><Star fill={index < rating ? "currentColor" : "none"} /></button>)}</div></fieldset><div className="field"><label htmlFor="review-text">Public review</label><textarea id="review-text" value={review} onChange={(event) => setReview(event.target.value)} placeholder="The item matched the listing and pickup was clear…" /></div><button className="button" disabled={!rating || review.trim().length < 10} onClick={() => setSubmitted(true)}>Submit review</button></section>;
}
