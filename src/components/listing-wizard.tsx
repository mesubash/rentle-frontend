"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Camera, Check, ChevronLeft, ChevronRight, Clock3, ImagePlus, MapPin, ShieldCheck, Wrench } from "lucide-react";
import { images } from "@/lib/data";

type Draft = { type: "Product" | "Service"; title: string; category: string; description: string; location: string; price: string; deposit: string; photos: string[] };
const initial: Draft = { type: "Product", title: "", category: "Cameras & Tech", description: "", location: "Kathmandu", price: "", deposit: "", photos: [] };
const steps = ["Type", "Details", "Photos", "Price & deposit", "Review"];

export function ListingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0); const [draft, setDraft] = useState<Draft>(initial); const [ready, setReady] = useState(false); const [publishing, setPublishing] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem("rentle-listing-draft");
      if (saved) setDraft(JSON.parse(saved));
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => { if (ready) window.localStorage.setItem("rentle-listing-draft", JSON.stringify(draft)); }, [draft, ready]);
  function update<K extends keyof Draft>(key: K, value: Draft[K]) { setDraft((current) => ({ ...current, [key]: value })); }
  function addPhotos(event: ChangeEvent<HTMLInputElement>) { update("photos", [...draft.photos, ...Array.from(event.target.files ?? []).map((file) => file.name)].slice(0, 6)); }
  function next() { setStep((current) => Math.min(4, current + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function publish() {
    setPublishing(true);
    window.localStorage.removeItem("rentle-listing-draft");
    const params = new URLSearchParams({ title: draft.title || "New Rentle listing", district: draft.location, price: draft.price || "0", type: draft.type });
    window.setTimeout(() => router.push(`/list/success?${params}`), 800);
  }
  const valid = step === 0 || (step === 1 ? draft.title && draft.description && draft.location : step === 2 ? draft.photos.length > 0 : step === 3 ? Number(draft.price) > 0 : true);

  return <main className="page"><div className="container listing-wizard">
    <header className="wizard-header"><div><p className="eyebrow">Create a listing</p><h1>{steps[step]}</h1><p>Your draft saves automatically on this device.</p></div><strong>Step {step + 1} of {steps.length}</strong></header>
    <ol className="wizard-progress">{steps.map((label, index) => <li className={index < step ? "is-done" : index === step ? "is-current" : ""} key={label}><span>{index < step ? <Check size={14} /> : index + 1}</span><b>{label}</b></li>)}</ol>

    <section className="wizard-card card">
      {step === 0 && <div className="wizard-section"><div className="wizard-question"><p className="eyebrow">First, choose a format</p><h2>What are you listing?</h2><p>The questions and pricing units change based on this choice.</p></div><div className="type-choice"><button className={draft.type === "Product" ? "is-selected" : ""} onClick={() => update("type", "Product")}><Box /><span><strong>A physical item</strong><small>Camera, clothing, camping gear, tools</small></span><i>{draft.type === "Product" && <Check />}</i></button><button className={draft.type === "Service" ? "is-selected" : ""} onClick={() => update("type", "Service")}><Wrench /><span><strong>A local service</strong><small>Photography, moving, event support</small></span><i>{draft.type === "Service" && <Check />}</i></button></div></div>}
      {step === 1 && <div className="wizard-section"><div className="wizard-question"><p className="eyebrow">Make it easy to understand</p><h2>Describe your {draft.type.toLowerCase()}</h2></div><div className="form-grid"><div className="field"><label htmlFor="listing-title">Listing title</label><input id="listing-title" value={draft.title} onChange={(event) => update("title", event.target.value)} placeholder={draft.type === "Product" ? "e.g. Canon EOS R5 with 24–70mm lens" : "e.g. Wedding photography — full day"} maxLength={80} /><small>{draft.title.length}/80 characters</small></div><div className="form-grid form-grid--two"><div className="field"><label htmlFor="listing-category">Category</label><select id="listing-category" value={draft.category} onChange={(event) => update("category", event.target.value)}><option>Cameras & Tech</option><option>Traditional Clothing</option><option>Tools & Camping</option><option>Event & Photography</option><option>Moving & Transport</option></select></div><div className="field"><label htmlFor="listing-location">District</label><select id="listing-location" value={draft.location} onChange={(event) => update("location", event.target.value)}><option>Kathmandu</option><option>Lalitpur</option><option>Bhaktapur</option><option>Pokhara</option></select></div></div><div className="field"><label htmlFor="listing-description">Description</label><textarea id="listing-description" value={draft.description} onChange={(event) => update("description", event.target.value)} placeholder="State what is included, its condition, and any handover details renters should know." /><small>Clear details reduce questions and improve trust.</small></div></div></div>}
      {step === 2 && <div className="wizard-section"><div className="wizard-question"><p className="eyebrow">Show the real condition</p><h2>Add clear photos</h2><p>Use natural light. Include the full item, close details, and any existing marks.</p></div><label className="photo-drop"><ImagePlus size={30} /><strong>Add up to 6 photos</strong><span>JPG, PNG or WEBP · first photo becomes the cover</span><input type="file" accept="image/*" multiple onChange={addPhotos} /></label>{draft.photos.length > 0 && <div className="photo-list">{draft.photos.map((photo, index) => <div key={`${photo}-${index}`}><Camera /><span>{index === 0 && <b>Cover</b>}<small>{photo}</small></span><button aria-label={`Remove ${photo}`} onClick={() => update("photos", draft.photos.filter((_, itemIndex) => itemIndex !== index))}>×</button></div>)}</div>}</div>}
      {step === 3 && <div className="wizard-section"><div className="wizard-question"><p className="eyebrow">Keep costs explicit</p><h2>Set price and deposit</h2><p>Renters see both amounts before sending a request.</p></div><div className="form-grid form-grid--two"><div className="field"><label htmlFor="listing-price">Price per {draft.type === "Product" ? "day" : "hour"}</label><div className="money-input"><span>NPR</span><input id="listing-price" inputMode="numeric" value={draft.price} onChange={(event) => update("price", event.target.value.replace(/\D/g, ""))} placeholder="2500" /></div></div><div className="field"><label htmlFor="listing-deposit">Refundable deposit</label><div className="money-input"><span>NPR</span><input id="listing-deposit" inputMode="numeric" value={draft.deposit} onChange={(event) => update("deposit", event.target.value.replace(/\D/g, ""))} placeholder="30000" /></div></div></div><div className="form-note"><ShieldCheck size={18} /><span>Rentle does not collect the deposit. The renter pays you directly after approval and uploads proof to the booking.</span></div><div className="suggestion card"><Clock3 /><div><strong>Suggested deposit for this category</strong><p>NPR 20,000–35,000. Choose an amount that reflects replacement risk without blocking serious renters.</p></div></div></div>}
      {step === 4 && <div className="wizard-section"><div className="wizard-question"><p className="eyebrow">Preview before publishing</p><h2>This is what renters will see.</h2></div><article className="listing-preview card"><div className="listing-preview__image"><Image src={images.sony} alt="Preview image for listing" fill sizes="600px" /><span className={`type-chip type-chip--${draft.type.toLowerCase()}`}>{draft.type}</span></div><div><p><MapPin size={14} /> {draft.location}</p><h2>{draft.title || "Your listing title"}</h2><p>{draft.description || "Your description will appear here."}</p><strong>NPR {Number(draft.price || 0).toLocaleString("en-NP")} / {draft.type === "Product" ? "day" : "hour"}</strong><small>Refundable deposit: NPR {Number(draft.deposit || 0).toLocaleString("en-NP")}</small></div></article><div className="review-checks"><p><Check /> Details are clear and specific</p><p><Check /> Price and deposit are visible</p><p><Check /> Your verified status appears beside the listing</p></div></div>}
    </section>
    <footer className="wizard-actions">{step > 0 ? <button className="button button--secondary" onClick={() => setStep((current) => current - 1)}><ChevronLeft size={17} /> Back</button> : <span />}{step < 4 ? <button className="button" disabled={!valid} onClick={next}>Continue <ChevronRight size={17} /></button> : <button className="button" disabled={publishing} onClick={publish}>{publishing ? "Publishing…" : "Publish listing"}</button>}</footer>
  </div></main>;
}
