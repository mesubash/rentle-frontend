"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Camera, Check, ChevronLeft, ChevronRight, Clock3, ImagePlus, MapPin, ShieldCheck, Wrench } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import Link from "next/link";
import { useToast } from "./toast-provider";
import { useAuth } from "./auth-provider";
import { useOrg } from "./org-provider";
import { categoriesApi, listingsApi, priceUnitLabel, type Category, type ItemCondition, type ListingType, type PriceUnit, type ServiceDuration } from "@/lib/api/listings";
import { templatesApi, type FieldDefinition } from "@/lib/api/templates";
import { DynamicFields } from "./dynamic-fields";
import { DISTRICT_OPTIONS } from "@/lib/districts";
import { PageBackLink } from "./page-back-link";

type Draft = { type: ListingType; title: string; categoryId: string; description: string; district: string; locationText: string; price: string; priceUnit: PriceUnit; deposit: string; rentalTerms: string; condition: ItemCondition; brand: string; model: string; minRentalDays: string; maxRentalDays: string; serviceAreaKm: string; typicalDuration: ServiceDuration; minNoticeHours: string; portfolioUrl: string };
const initial: Draft = { type: "PRODUCT", title: "", categoryId: "", description: "", district: "Kathmandu", locationText: "", price: "", priceUnit: "PER_DAY", deposit: "", rentalTerms: "", condition: "GOOD", brand: "", model: "", minRentalDays: "1", maxRentalDays: "", serviceAreaKm: "", typicalDuration: "HOURLY", minNoticeHours: "24", portfolioUrl: "" };
const steps = ["Type", "Details", "Photos", "Price & deposit", "Review"];

export function ListingWizard() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { activeOrg, setActiveOrgId } = useOrg();
  const [step, setStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(() => {
    if (typeof window === "undefined") return initial;
    const saved = window.localStorage.getItem("rentle-listing-draft");
    if (!saved) return initial;
    try {
      const restored = { ...initial, ...JSON.parse(saved) } as Draft;
      return { ...restored, priceUnit: restored.type === "PRODUCT" ? (restored.priceUnit === "FLAT" ? "FLAT" : "PER_DAY") : (restored.priceUnit === "FLAT" ? "FLAT" : "PER_HOUR") };
    } catch { return initial; }
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [categoryFields, setCategoryFields] = useState<FieldDefinition[]>([]);
  const [attrValues, setAttrValues] = useState<Record<string, unknown>>({});

  // Load this category's LISTING field template (docs/12) when the category changes.
  useEffect(() => {
    if (!draft.categoryId) return;
    let active = true;
    templatesApi.current(draft.categoryId, "LISTING")
      .then((tpl) => { if (active) setCategoryFields(tpl?.fields ?? []); })
      .catch(() => { if (active) setCategoryFields([]); });
    return () => { active = false; };
  }, [draft.categoryId]);

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => setError("Categories could not be loaded. Check that the Rentle backend is running."));
  }, []);

  useEffect(() => { window.localStorage.setItem("rentle-listing-draft", JSON.stringify(draft)); }, [draft]);

  const availableCategories = categories.filter((item) => item.listingType === draft.type || item.listingType === "BOTH");
  const selectedCategory = categories.find((item) => item.id === draft.categoryId);
  function update<K extends keyof Draft>(key: K, value: Draft[K]) { setDraft((current) => ({ ...current, [key]: value })); }
  function selectType(type: ListingType) { setDraft((current) => ({ ...current, type, categoryId: "", priceUnit: type === "PRODUCT" ? (current.priceUnit === "FLAT" ? "FLAT" : "PER_DAY") : (current.priceUnit === "FLAT" ? "FLAT" : "PER_HOUR") })); }
  function addPhotos(event: ChangeEvent<HTMLInputElement>) { setPhotos((current) => [...current, ...Array.from(event.target.files ?? [])].slice(0, 6)); }
  function next() {
    setStep((current) => {
      const nextStep = Math.min(4, current + 1);
      setFurthestStep((furthest) => Math.max(furthest, nextStep));
      return nextStep;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToStep(index: number) {
    if (index > furthestStep) return;
    setStep(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function publish() {
    setPublishing(true); setError("");
    try {
      const listing = await listingsApi.create({
        type: draft.type,
        title: draft.title.trim(),
        description: draft.description.trim(),
        categoryId: draft.categoryId,
        pricePerUnit: Number(draft.price),
        priceUnit: draft.priceUnit,
        district: draft.district,
        locationText: draft.locationText.trim() || undefined,
        depositAmount: Number(draft.deposit || 0),
        rentalTerms: draft.rentalTerms.trim() || undefined,
        attributes: categoryFields.length ? attrValues : undefined,
        orgId: activeOrg?.id,   // list as the active organization when one is selected
        ...(draft.type === "PRODUCT" ? { product: { condition: draft.condition, brand: optionalText(draft.brand), model: optionalText(draft.model), minRentalDays: Number(draft.minRentalDays), maxRentalDays: optionalNumber(draft.maxRentalDays) } } : { service: { serviceAreaKm: optionalNumber(draft.serviceAreaKm), typicalDuration: draft.typicalDuration, minNoticeHours: Number(draft.minNoticeHours), portfolioUrl: optionalText(draft.portfolioUrl) } }),
      });
      if (photos.length) await listingsApi.uploadImages(listing.id, photos);
      await listingsApi.update(listing.id, { status: "ACTIVE" });
      window.localStorage.removeItem("rentle-listing-draft");
      showToast("Listing published successfully.", { tone: "success" });
      router.push(`/list/success?id=${listing.id}`);
    } catch (caught) {
      const message = caught instanceof ApiError ? caught.message : "We could not publish your listing.";
      setError(message);
      showToast(message, { tone: "error" });
      setPublishing(false);
    }
  }

  const productDetailsValid = Number(draft.minRentalDays) >= 1 && (!draft.maxRentalDays || Number(draft.maxRentalDays) >= Number(draft.minRentalDays));
  const serviceDetailsValid = (!draft.serviceAreaKm || Number(draft.serviceAreaKm) >= 0) && Number(draft.minNoticeHours) >= 0;
  const valid = step === 0 || (step === 1 ? Boolean(draft.title.trim().length >= 5 && draft.description.trim().length >= 20 && draft.categoryId && draft.district && (draft.type === "PRODUCT" ? productDetailsValid : serviceDetailsValid)) : step === 2 ? photos.length > 0 : step === 3 ? Number(draft.price) >= 1 && Number(draft.deposit || 0) >= 0 : true);
  const typeLabel = draft.type === "PRODUCT" ? "Product" : "Service";
  const unitLabel = priceUnitLabel(draft.priceUnit);

  // Only verified users can publish (backend enforces it) — gate before the wizard so an
  // unverified owner isn't sent through five steps only to be rejected at publish.
  if (!authLoading && !user) {
    return <main className="page listing-flow-page"><div className="container narrow-page"><PageBackLink href="/listings/manage">Back to manage listings</PageBackLink><section className="access-gate"><h1>Log in to create a listing</h1><p>Your listings and booking requests are connected to your Rentle account.</p><Link className="button" href="/login?next=/list">Log in</Link></section></div></main>;
  }
  if (!authLoading && user && user.status !== "VERIFIED") {
    return <main className="page listing-flow-page"><div className="container narrow-page"><PageBackLink href="/listings/manage">Back to manage listings</PageBackLink><section className="access-gate"><h1>{user.status === "SUSPENDED" ? "Listing is unavailable" : "Verify your identity to list"}</h1><p>{user.status === "SUSPENDED" ? "Your account is suspended. Contact support if you think this is a mistake." : "Complete phone, email, and identity verification before publishing a listing."}</p>{user.status !== "SUSPENDED" && <Link className="button" href="/verification">Start verification</Link>}</section></div></main>;
  }

  return <main className="page listing-flow-page"><div className="container listing-wizard">
    <PageBackLink href="/listings/manage">Back to manage listings</PageBackLink>
    <header className="wizard-header"><div><p className="eyebrow">Create a listing</p><h1>{steps[step]}</h1><p>Your text draft saves on this device. Photos stay only in this tab until publishing.</p></div><strong>Step {step + 1} of {steps.length}</strong></header>
    {activeOrg && <p className="form-note">Listing as <strong>{activeOrg.name}</strong>. <button type="button" className="link-button" onClick={() => setActiveOrgId(null)}>List personally instead</button></p>}
    <ol className="wizard-progress">{steps.map((label, index) => <li className={index < step ? "is-done" : index === step ? "is-current" : ""} key={label}><button type="button" disabled={index > furthestStep} aria-current={index === step ? "step" : undefined} onClick={() => goToStep(index)}><span>{index < step ? <Check size={14} /> : index + 1}</span><b>{label}</b></button></li>)}</ol>
    <section className="wizard-card card">
      {step === 0 && <div className="wizard-section"><div className="wizard-question"><p className="eyebrow">Choose a format</p><h2>What are you listing?</h2><p>This sets the relevant pricing and item details.</p></div><div className="type-choice"><button className={draft.type === "PRODUCT" ? "is-selected" : ""} onClick={() => selectType("PRODUCT")}><Box /><span><strong>A physical item</strong><small>Camera, clothing, camping gear, tools</small></span><i>{draft.type === "PRODUCT" && <Check />}</i></button><button className={draft.type === "SERVICE" ? "is-selected" : ""} onClick={() => selectType("SERVICE")}><Wrench /><span><strong>A local service</strong><small>Photography, moving, event support</small></span><i>{draft.type === "SERVICE" && <Check />}</i></button></div></div>}
      {step === 1 && <div className="wizard-section"><div className="wizard-question"><p className="eyebrow">Make it easy to understand</p><h2>Describe your {typeLabel.toLowerCase()}</h2></div><div className="form-grid"><div className="field"><label htmlFor="listing-title">Listing title</label><input id="listing-title" value={draft.title} onChange={(event) => update("title", event.target.value)} placeholder={draft.type === "PRODUCT" ? "Canon EOS R5 with lens" : "Full-day event photography"} maxLength={120} /><small>{draft.title.length}/120 · at least 5 characters</small></div><div className="form-grid form-grid--two"><div className="field"><label htmlFor="listing-category">Category</label><select id="listing-category" value={draft.categoryId} onChange={(event) => update("categoryId", event.target.value)}><option value="">Select category</option>{availableCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div><div className="field"><label htmlFor="listing-district">District</label><select id="listing-district" value={draft.district} onChange={(event) => update("district", event.target.value)} required>{DISTRICT_OPTIONS.filter((option) => option.value).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div></div><div className="field"><label htmlFor="listing-area">Pickup area or service location</label><input id="listing-area" value={draft.locationText} onChange={(event) => update("locationText", event.target.value)} placeholder="e.g. Patan Dhoka" maxLength={200} /></div>{draft.type === "PRODUCT" ? <><div className="form-grid form-grid--two"><div className="field"><label htmlFor="listing-condition">Condition</label><select id="listing-condition" value={draft.condition} onChange={(event) => update("condition", event.target.value as ItemCondition)}><option value="NEW">New</option><option value="GOOD">Good</option><option value="FAIR">Fair</option></select></div><div className="field"><label htmlFor="listing-brand">Brand (optional)</label><input id="listing-brand" value={draft.brand} onChange={(event) => update("brand", event.target.value)} maxLength={100} placeholder="e.g. Canon" /></div><div className="field"><label htmlFor="listing-model">Model (optional)</label><input id="listing-model" value={draft.model} onChange={(event) => update("model", event.target.value)} maxLength={100} placeholder="e.g. EOS R5" /></div><div className="field"><label htmlFor="listing-min-days">Minimum rental days</label><input id="listing-min-days" type="number" min="1" step="1" value={draft.minRentalDays} onChange={(event) => update("minRentalDays", event.target.value)} required /></div><div className="field"><label htmlFor="listing-max-days">Maximum rental days (optional)</label><input id="listing-max-days" type="number" min={draft.minRentalDays || "1"} step="1" value={draft.maxRentalDays} onChange={(event) => update("maxRentalDays", event.target.value)} /></div></div></> : <div className="form-grid form-grid--two"><div className="field"><label htmlFor="listing-service-area">Service area radius in km (optional)</label><input id="listing-service-area" type="number" min="0" step="1" value={draft.serviceAreaKm} onChange={(event) => update("serviceAreaKm", event.target.value)} placeholder="e.g. 10" /></div><div className="field"><label htmlFor="listing-duration">Typical duration</label><select id="listing-duration" value={draft.typicalDuration} onChange={(event) => update("typicalDuration", event.target.value as ServiceDuration)}><option value="HOURLY">Hourly</option><option value="HALF_DAY">Half day</option><option value="FULL_DAY">Full day</option><option value="CUSTOM">Custom</option></select></div><div className="field"><label htmlFor="listing-notice">Minimum notice hours</label><input id="listing-notice" type="number" min="0" step="1" value={draft.minNoticeHours} onChange={(event) => update("minNoticeHours", event.target.value)} required /></div><div className="field"><label htmlFor="listing-portfolio">Portfolio URL (optional)</label><input id="listing-portfolio" type="url" value={draft.portfolioUrl} onChange={(event) => update("portfolioUrl", event.target.value)} maxLength={500} placeholder="https://example.com/work" /></div></div>}<div className="field"><label htmlFor="listing-description">Description</label><textarea id="listing-description" value={draft.description} onChange={(event) => update("description", event.target.value)} placeholder="State what is included, its condition, and handover details." maxLength={2000} /><small>{draft.description.length}/2000 · at least 20 characters</small></div><DynamicFields fields={categoryFields} values={attrValues} onChange={(key, value) => setAttrValues((current) => ({ ...current, [key]: value }))} idPrefix="listing-attr" /></div></div>}
      {step === 2 && <div className="wizard-section"><div className="wizard-question"><p className="eyebrow">Show the real condition</p><h2>Add clear photos</h2><p>Use natural light and include any existing marks.</p></div><label className="photo-drop"><ImagePlus size={30} /><strong>Add up to 6 photos</strong><span>JPG, PNG or WEBP · first photo is the cover</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addPhotos} /></label>{photos.length > 0 && <div className="photo-list">{photos.map((photo, index) => <div key={`${photo.name}-${photo.lastModified}`}><Camera /><span>{index === 0 && <b>Cover</b>}<small>{photo.name}</small></span><button type="button" aria-label={`Remove ${photo.name}`} onClick={() => setPhotos((current) => current.filter((_, itemIndex) => itemIndex !== index))}>×</button></div>)}</div>}</div>}
      {step === 3 && <div className="wizard-section"><div className="wizard-question"><p className="eyebrow">Keep costs explicit</p><h2>Set price and deposit</h2><p>Renters see both before sending a request.</p></div><div className="form-grid form-grid--two"><div className="field"><label htmlFor="listing-price">Price</label><div className="money-input"><span>NPR</span><input id="listing-price" inputMode="decimal" value={draft.price} onChange={(event) => update("price", event.target.value.replace(/[^\d.]/g, ""))} placeholder="2500" /></div><small>Charged per {unitLabel}</small></div><div className="field"><label htmlFor="listing-price-unit">Price unit</label><select id="listing-price-unit" value={draft.priceUnit} onChange={(event) => update("priceUnit", event.target.value as PriceUnit)}>{draft.type === "PRODUCT" ? <><option value="PER_DAY">Per day</option><option value="FLAT">Flat fee</option></> : <><option value="PER_HOUR">Per hour</option><option value="FLAT">Flat fee</option></>}</select></div><div className="field"><label htmlFor="listing-deposit">Refundable deposit</label><div className="money-input"><span>NPR</span><input id="listing-deposit" inputMode="decimal" value={draft.deposit} onChange={(event) => update("deposit", event.target.value.replace(/[^\d.]/g, ""))} placeholder="0" /></div></div></div><div className="form-note"><ShieldCheck size={18} /><span>The renter uploads payment proof after approval. Confirm it only after checking the payment yourself.</span></div><div className="suggestion card"><Clock3 /><div><strong>Choose a proportionate deposit</strong><p>Use replacement risk and condition, and keep the reason clear during handover.</p></div></div><div className="field"><label htmlFor="listing-terms">Rental terms <span className="muted">(optional)</span></label><textarea id="listing-terms" maxLength={2000} value={draft.rentalTerms} onChange={(event) => update("rentalTerms", event.target.value)} placeholder="House rules, expected condition on return, late fees — the renter accepts these when they request." /><small>Shown to the renter and recorded with each booking.</small></div></div>}
      {step === 4 && <div className="wizard-section"><div className="wizard-question"><p className="eyebrow">Review before publishing</p><h2>Check the listing details.</h2></div><article className="listing-preview card"><div className="listing-preview__image listing-card__placeholder"><Camera /><span>{photos.length} photo{photos.length === 1 ? "" : "s"} ready</span><span className={`type-chip type-chip--${typeLabel.toLowerCase()}`}>{typeLabel}</span></div><div><p><MapPin size={14} /> {draft.locationText ? `${draft.locationText}, ` : ""}{draft.district}</p><h2>{draft.title}</h2><p>{draft.description}</p><strong>NPR {Number(draft.price).toLocaleString("en-NP")} / {unitLabel}</strong><small>Refundable deposit: NPR {Number(draft.deposit || 0).toLocaleString("en-NP")} · {selectedCategory?.name}</small></div></article><div className="review-checks"><p><Check /> Details describe the real offer</p><p><Check /> Price and deposit are visible</p><p><Check /> Photos show current condition</p></div></div>}
    </section>
    {error && <p className="form-error" role="alert">{error}</p>}
    <footer className="wizard-actions">{step > 0 ? <button className="button button--secondary" onClick={() => setStep((current) => current - 1)}><ChevronLeft size={17} /> Back</button> : <span />}{step < 4 ? <button className="button" disabled={!valid} onClick={next}>Continue <ChevronRight size={17} /></button> : <button className="button" disabled={publishing} onClick={publish}>{publishing ? "Publishing…" : "Publish listing"}</button>}</footer>
  </div></main>;
}

function optionalText(value: string) {
  return value.trim() || undefined;
}

function optionalNumber(value: string) {
  return value === "" ? undefined : Number(value);
}
