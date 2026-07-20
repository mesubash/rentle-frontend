"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { CalendarDays, Check, ChevronLeft, ChevronRight, ExternalLink, ImagePlus, Info, Settings2, Trash2, Upload } from "lucide-react";
import { assetUrl } from "@/lib/api/assets";
import { ApiError } from "@/lib/api/client";
import { listingsApi, priceUnitLabel, type Availability, type ListingDetail, type ListingImageItem, type ListingStatus } from "@/lib/api/listings";
import { DISTRICT_OPTIONS } from "@/lib/districts";
import { ConfirmDialog } from "./confirm-dialog";
import { useToast } from "./toast-provider";
import styles from "./listing-manage-view.module.css";
import { PageBackLink } from "./page-back-link";

type EditDraft = {
  title: string;
  description: string;
  price: string;
  deposit: string;
  district: string;
  locationText: string;
  status: Exclude<ListingStatus, "REMOVED">;
};

type PendingPhoto = { file: File; previewUrl: string; key: string };
type ConfirmTarget = { kind: "listing" } | { kind: "photo"; photo: ListingImageItem } | null;

const steps = [
  { label: "Listing details", icon: Settings2 },
  { label: "Photos & status", icon: ImagePlus },
  { label: "Availability", icon: CalendarDays },
] as const;
const maxPhotos = 6;

export function ListingManageView({ listingId }: { listingId: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget>(null);
  const pendingPhotosRef = useRef<PendingPhoto[]>([]);

  const loadAvailability = useCallback(() => listingsApi.availability(listingId).then(setAvailability).catch(() => undefined), [listingId]);

  useEffect(() => {
    listingsApi.detail(listingId)
      .then((item) => { setListing(item); setDraft(toDraft(item)); })
      .catch(() => setError("This listing could not be loaded."));
    void loadAvailability();
  }, [listingId, loadAvailability]);

  useEffect(() => () => {
    pendingPhotosRef.current.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
  }, []);

  function update<K extends keyof EditDraft>(key: K, value: EditDraft[K]) {
    setDraft((current) => current ? { ...current, [key]: value } : current);
  }

  function goToStep(nextStep: number) {
    setError("");
    setStep(Math.max(0, Math.min(steps.length - 1, nextStep)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!draft || !listing || !detailsValid) return;
    setSaving(true);
    setError("");
    try {
      const updated = await listingsApi.update(listingId, {
        title: draft.title.trim(),
        description: draft.description.trim(),
        pricePerUnit: Number(draft.price),
        depositAmount: Number(draft.deposit || 0),
        district: draft.district,
        locationText: draft.locationText.trim(),
        status: draft.status,
      });
      if (pendingPhotos.length) await listingsApi.uploadImages(listingId, pendingPhotos.map((photo) => photo.file));
      const refreshed = pendingPhotos.length ? await listingsApi.detail(listingId) : updated;
      clearPendingPhotos();
      setListing(refreshed);
      setDraft(toDraft(refreshed));
      showToast("Listing changes saved.", { tone: "success" });
    } catch (caught) {
      const message = caught instanceof ApiError ? caught.message : "Changes could not be saved.";
      setError(message);
      showToast(message, { tone: "error" });
    } finally {
      setSaving(false);
    }
  }

  function addPhotos(event: ChangeEvent<HTMLInputElement>) {
    if (!listing) return;
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    const availableSlots = Math.max(0, maxPhotos - existingPhotos(listing).length - pendingPhotos.length);
    if (!availableSlots) {
      showToast(`A listing can have up to ${maxPhotos} photos.`, { tone: "error" });
      return;
    }
    const existingKeys = new Set(pendingPhotos.map((photo) => photo.key));
    const uniqueFiles = files.filter((file) => !existingKeys.has(fileKey(file))).slice(0, availableSlots);
    const additions = uniqueFiles.map((file) => ({ file, previewUrl: URL.createObjectURL(file), key: fileKey(file) }));
    const next = [...pendingPhotos, ...additions];
    pendingPhotosRef.current = next;
    setPendingPhotos(next);
    if (uniqueFiles.length < files.length) showToast(`Only ${availableSlots} more photo${availableSlots === 1 ? "" : "s"} can be added.`, { tone: "info" });
  }

  function removePendingPhoto(key: string) {
    const target = pendingPhotos.find((photo) => photo.key === key);
    if (target) URL.revokeObjectURL(target.previewUrl);
    const next = pendingPhotos.filter((photo) => photo.key !== key);
    pendingPhotosRef.current = next;
    setPendingPhotos(next);
  }

  function clearPendingPhotos() {
    pendingPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    pendingPhotosRef.current = [];
    setPendingPhotos([]);
  }

  async function confirmDelete() {
    if (!confirmTarget) return;
    setDeleting(true);
    setError("");
    try {
      if (confirmTarget.kind === "listing") {
        await listingsApi.remove(listingId);
        router.push("/listings/manage");
        return;
      }
      await listingsApi.deleteImage(listingId, confirmTarget.photo.id);
      const refreshed = await listingsApi.detail(listingId);
      setListing(refreshed);
      setConfirmTarget(null);
      showToast("Photo removed.", { tone: "success" });
    } catch (caught) {
      const message = caught instanceof ApiError ? caught.message : "The item could not be removed.";
      setError(message);
      showToast(message, { tone: "error" });
    } finally {
      setDeleting(false);
    }
  }

  async function block(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      setAvailability(await listingsApi.blockDates(listingId, {
        startDate: String(form.get("startDate")),
        endDate: String(form.get("endDate")),
        reason: String(form.get("reason")) || undefined,
      }));
      event.currentTarget.reset();
      showToast("Unavailable dates added.", { tone: "success" });
    } catch (caught) {
      const message = caught instanceof ApiError ? caught.message : "Dates could not be blocked.";
      setError(message);
      showToast(message, { tone: "error" });
    }
  }

  async function unblock(rangeId: string) {
    try {
      await listingsApi.unblockDates(listingId, rangeId);
      await loadAvailability();
      showToast("Date block removed.", { tone: "success" });
    } catch {
      setError("The blocked range could not be removed.");
    }
  }

  if (!listing || !draft) return <main className="page"><div className={`container ${styles.root}`}><PageBackLink href="/listings/manage">Back to manage listings</PageBackLink><section className="manage-loading card">{error || "Loading listing…"}</section></div></main>;

  const detailsValid = draft.title.trim().length >= 5
    && draft.description.trim().length >= 20
    && Number(draft.price) >= 1
    && Number(draft.deposit || 0) >= 0
    && Boolean(draft.district);
  const currentPhotos = existingPhotos(listing);
  const photoCount = currentPhotos.length + pendingPhotos.length;
  const unit = priceUnitLabel(listing.priceUnit);

  return <main className="page"><div className={`container ${styles.root}`}>
    <PageBackLink href="/listings/manage">Back to manage listings</PageBackLink>
    <header className="manage-header">
      <div><p className="eyebrow">Owner workspace</p><h1>Edit {listing.title}</h1><p>Keep the details, photos, publishing status, and availability up to date.</p></div>
      <Link className="button button--secondary" href={`/listing/${listing.id}`}>View public page <ExternalLink size={16} /></Link>
    </header>

    <nav className="manage-steps" aria-label="Listing editor sections">
      {steps.map((item, index) => { const Icon = item.icon; return <button type="button" key={item.label} className={step === index ? "is-active" : ""} aria-current={step === index ? "step" : undefined} onClick={() => goToStep(index)}><span>{step > index ? <Check size={16} /> : <Icon size={17} />}</span><b>{item.label}</b><small>{index + 1} of {steps.length}</small></button>; })}
    </nav>

    {step < 2 && <form className="manage-card card" onSubmit={save}>
      {step === 0 && <section className="manage-section">
        <div className="manage-section__heading"><p className="eyebrow">Core information</p><h2>Listing details</h2><p>This information appears everywhere your listing is shown.</p></div>
        <div className="form-grid">
          <div className="field"><label htmlFor="manage-title">Title</label><input id="manage-title" value={draft.title} onChange={(event) => update("title", event.target.value)} minLength={5} maxLength={120} required /><small>{draft.title.length}/120 · at least 5 characters</small></div>
          <div className="field"><label htmlFor="manage-description">Description</label><textarea id="manage-description" value={draft.description} onChange={(event) => update("description", event.target.value)} minLength={20} maxLength={2000} required /><small>{draft.description.length}/2000 · at least 20 characters</small></div>
          <div className="form-grid form-grid--two">
            <div className="field"><label htmlFor="manage-price">Price</label><div className="money-input"><span>NPR</span><input id="manage-price" inputMode="decimal" value={draft.price} onChange={(event) => update("price", sanitizeMoney(event.target.value))} placeholder="500" required /></div><small>Charged per {unit}</small></div>
            <div className="field"><label htmlFor="manage-deposit">Refundable deposit</label><div className="money-input"><span>NPR</span><input id="manage-deposit" inputMode="decimal" value={draft.deposit} onChange={(event) => update("deposit", sanitizeMoney(event.target.value))} placeholder="0" required /></div><small>Enter 0 when no deposit is required.</small></div>
            <div className="field"><label htmlFor="manage-district">District</label><select id="manage-district" value={draft.district} onChange={(event) => update("district", event.target.value)} required>{DISTRICT_OPTIONS.filter((option) => option.value).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
            <div className="field"><label htmlFor="manage-location">Pickup area or service location</label><input id="manage-location" value={draft.locationText} onChange={(event) => update("locationText", event.target.value)} maxLength={200} placeholder="e.g. Patan Dhoka" /></div>
          </div>
        </div>
      </section>}

      {step === 1 && <section className="manage-section">
        <div className="manage-section__heading"><p className="eyebrow">Presentation</p><h2>Photos and publishing</h2><p>Add several clear photos. New selections are appended, not replaced.</p></div>
        <div className="field"><label htmlFor="manage-status">Publishing status</label><select id="manage-status" value={draft.status} onChange={(event) => update("status", event.target.value as EditDraft["status"])}><option value="ACTIVE">Active — visible in Explore</option><option value="INACTIVE">Paused — hidden from Explore</option><option value="DRAFT">Draft — not published</option></select><small>You can change this without deleting the listing.</small></div>
        <label className={photoCount >= maxPhotos ? "photo-drop is-disabled" : "photo-drop"}><Upload size={28} /><strong>{photoCount >= maxPhotos ? "Photo limit reached" : "Choose one or more photos"}</strong><span>JPG, PNG or WEBP · up to {maxPhotos} total · {photoCount}/{maxPhotos} used</span><input id="manage-photos" type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={photoCount >= maxPhotos} onChange={addPhotos} /></label>
        {photoCount > 0 ? <div className="manage-photo-grid">
          {currentPhotos.map((photo, index) => <figure key={photo.id || photo.url} className="manage-photo"><div>{assetUrl(photo.url) && <Image src={assetUrl(photo.url)!} alt={`${listing.title} photo ${index + 1}`} fill sizes="(max-width: 640px) 50vw, 220px" loading={index === 0 ? "eager" : "lazy"} />}</div><figcaption><span>{index === 0 ? "Cover photo" : `Photo ${index + 1}`}</span>{photo.id && <button type="button" aria-label={`Remove photo ${index + 1}`} onClick={() => setConfirmTarget({ kind: "photo", photo })}><Trash2 size={16} /></button>}</figcaption></figure>)}
          {pendingPhotos.map((photo, index) => <figure key={photo.key} className="manage-photo is-pending"><div><Image src={photo.previewUrl} alt={`New photo ${index + 1} preview`} fill unoptimized sizes="(max-width: 640px) 50vw, 220px" /><span>Ready to upload</span></div><figcaption><span>{photo.file.name}</span><button type="button" aria-label={`Remove ${photo.file.name}`} onClick={() => removePendingPhoto(photo.key)}><Trash2 size={16} /></button></figcaption></figure>)}
        </div> : <div className="manage-photo-empty"><ImagePlus /><div><strong>No photos yet</strong><p>Add at least one photo so renters can understand the listing.</p></div></div>}
        {pendingPhotos.length > 0 && <p className="form-note"><Info size={17} /><span>{pendingPhotos.length} new photo{pendingPhotos.length === 1 ? " is" : "s are"} ready. They will upload when you save changes.</span></p>}
      </section>}

      {error && <p className="form-error" role="alert">{error}</p>}
      <footer className="manage-actions">
        {step > 0 ? <button type="button" className="button button--secondary" onClick={() => goToStep(step - 1)}><ChevronLeft size={17} /> Back</button> : <button type="button" className="button button--danger" onClick={() => setConfirmTarget({ kind: "listing" })}>Remove listing</button>}
        <div>{step === 0 && <button type="button" className="button button--secondary" disabled={!detailsValid} onClick={() => goToStep(1)}>Continue <ChevronRight size={17} /></button>}<button className="button" disabled={saving || !detailsValid}>{saving ? "Saving…" : pendingPhotos.length ? `Save & upload ${pendingPhotos.length}` : "Save changes"}</button></div>
      </footer>
    </form>}

    {step === 2 && <section className="manage-card card manage-section">
      <div className="manage-section__heading"><p className="eyebrow">Booking calendar</p><h2>Availability</h2><p>Block dates when this listing cannot be booked.</p></div>
      <form className="form-grid" onSubmit={block}>
        <div className="form-grid form-grid--two"><div className="field"><label htmlFor="block-start">Start date</label><input id="block-start" name="startDate" type="date" min={today()} required /></div><div className="field"><label htmlFor="block-end">End date</label><input id="block-end" name="endDate" type="date" min={today()} required /></div></div>
        <div className="field"><label htmlFor="block-reason">Private note <span className="muted">(optional)</span></label><input id="block-reason" name="reason" maxLength={200} placeholder="e.g. Personal use" /></div>
        <button className="button manage-block-button">Block these dates</button>
      </form>
      <div className="manage-ranges"><h3>Unavailable dates</h3>{availability?.blocked.length ? availability.blocked.map((range) => <article key={`${range.rangeId}-${range.startDate}`}><div><strong>{formatDate(range.startDate)} – {formatDate(range.endDate)}</strong><span>{range.source === "BOOKED" ? "Confirmed booking" : "Blocked by you"}</span></div>{range.rangeId && range.source === "OWNER_BLOCKED" && <button type="button" className="text-button" onClick={() => unblock(range.rangeId!)}>Remove block</button>}</article>) : <div className="manage-photo-empty"><CalendarDays /><div><strong>No blocked dates</strong><p>The listing is currently available for all future dates.</p></div></div>}</div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <footer className="manage-actions"><button type="button" className="button button--secondary" onClick={() => goToStep(1)}><ChevronLeft size={17} /> Back</button><Link className="button" href="/listings/manage">Done</Link></footer>
    </section>}

    <ConfirmDialog open={Boolean(confirmTarget)} title={confirmTarget?.kind === "listing" ? "Remove this listing?" : "Remove this photo?"} message={confirmTarget?.kind === "listing" ? "It will disappear from Rentle, but existing booking records will remain." : "This photo will be permanently removed from the listing."} confirmLabel={confirmTarget?.kind === "listing" ? "Remove listing" : "Remove photo"} danger busy={deleting} onConfirm={confirmDelete} onCancel={() => setConfirmTarget(null)} />
  </div></main>;
}

function toDraft(listing: ListingDetail): EditDraft {
  return {
    title: listing.title,
    description: listing.description,
    price: String(listing.pricePerUnit),
    deposit: String(listing.depositAmount),
    district: listing.district,
    locationText: listing.locationText ?? "",
    status: listing.status === "REMOVED" ? "INACTIVE" : listing.status,
  };
}

function sanitizeMoney(value: string) {
  const sanitized = value.replace(/[^\d.]/g, "");
  const [whole = "", ...decimals] = sanitized.split(".");
  return decimals.length ? `${whole}.${decimals.join("").slice(0, 2)}` : whole;
}

function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function existingPhotos(listing: ListingDetail): ListingImageItem[] {
  if (listing.imageItems?.length) return listing.imageItems;
  return listing.images.map((url, index) => ({ id: "", url, sortOrder: index }));
}

function today() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NP", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}
