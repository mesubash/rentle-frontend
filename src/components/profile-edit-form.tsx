"use client";

import { type FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Camera, CheckCircle2 } from "lucide-react";
import { useAuth } from "./auth-provider";
import { useToast } from "./toast-provider";
import { ApiError } from "@/lib/api/client";
import { usersApi } from "@/lib/api/users";

export function ProfileEditForm() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const photoRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const accountType = form.get("accountType") === "BUSINESS" ? "BUSINESS" : "INDIVIDUAL";
      let updated = await usersApi.updateMe({
        fullName: user?.citizenshipVerified ? undefined : String(form.get("fullName")),
        email: String(form.get("email")),
        paymentWallet: String(form.get("paymentWallet")).trim() || null,
        accountType,
        businessName: accountType === "BUSINESS" ? (String(form.get("businessName")).trim() || null) : null,
      });
      if (photo) updated = await usersApi.uploadPhoto(photo);
      setUser(updated); setSaved(true);
      showToast("Profile changes saved.", { tone: "success" });
      window.setTimeout(() => router.push("/profile"), 500);
    } catch (caught) {
      const message = caught instanceof ApiError ? caught.message : "We could not save your profile.";
      setError(message);
      showToast(message, { tone: "error" });
    } finally { setSaving(false); }
  }

  if (!user) return <section className="card card-pad"><h2>Log in to edit your profile</h2><Link className="button" href="/login">Log in</Link></section>;

  return <form className="card card-pad form-grid" onSubmit={submit}>
    <div className="form-grid form-grid--two"><div className="field"><label htmlFor="edit-name">Full name</label><input id="edit-name" name="fullName" defaultValue={user.fullName} required disabled={user.citizenshipVerified} />{user.citizenshipVerified && <small>Your verified legal name can&rsquo;t be changed.</small>}</div><div className="field"><label htmlFor="edit-email">Email address</label><input id="edit-email" name="email" type="email" defaultValue={user.email} required /></div></div>
    <div className="field"><label htmlFor="edit-payment-wallet">Payment wallet</label><input id="edit-payment-wallet" name="paymentWallet" defaultValue={user.paymentWallet ?? ""} maxLength={100} placeholder="eSewa or Khalti ID" /><small>Optional. This is shown to renters when they need to send a booking deposit.</small></div>
    <div className="form-grid form-grid--two"><div className="field"><label htmlFor="edit-account-type">Account type</label><select id="edit-account-type" name="accountType" defaultValue={user.accountType}><option value="INDIVIDUAL">Individual</option><option value="BUSINESS">Business / company</option></select><small>A business can register workers who attend bookings on its behalf.</small></div><div className="field"><label htmlFor="edit-business-name">Business name</label><input id="edit-business-name" name="businessName" defaultValue={user.businessName ?? ""} maxLength={120} placeholder="e.g. Everest Movers Pvt. Ltd." /><small>Shown on your listings as a &ldquo;Registered business&rdquo;.</small></div></div>
    {user.accountType === "BUSINESS" && <div className="form-note"><span>Manage the people who attend your bookings on the <Link href="/workers">Workers</Link> page.</span></div>}
    <div className="field"><label>Profile photo</label><input ref={photoRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} /><button className="button button--secondary" type="button" onClick={() => photoRef.current?.click()}><Camera size={17} /> {photo ? photo.name : "Choose photo"}</button><small>JPG, PNG, or WEBP. Use a clear photo of yourself.</small></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="button-row"><button className="button" type="submit" disabled={saving || saved}>{saving ? "Saving…" : saved ? <><CheckCircle2 size={17} /> Saved</> : "Save changes"}</button><Link className="button button--secondary" href="/profile">Cancel</Link></div>
  </form>;
}
