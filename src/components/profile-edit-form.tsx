"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export function ProfileEditForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  function submit(event: FormEvent) { event.preventDefault(); setSaving(true); window.setTimeout(() => { setSaving(false); setSaved(true); window.setTimeout(() => router.push("/profile"), 700); }, 550); }
  return <form className="card card-pad form-grid" onSubmit={submit}><div className="form-grid form-grid--two"><div className="field"><label htmlFor="edit-name">Full name</label><input id="edit-name" name="name" defaultValue="Aayush Shrestha" required /></div><div className="field"><label htmlFor="edit-city">Area and district</label><input id="edit-city" name="location" defaultValue="Patan, Lalitpur" required /></div></div><div className="field"><label htmlFor="edit-bio">About you</label><textarea id="edit-bio" name="bio" defaultValue="Camera enthusiast, weekend cyclist, and careful renter." required /></div><div className="button-row"><button className="button" type="submit" disabled={saving || saved}>{saving ? "Saving…" : saved ? <><CheckCircle2 size={17} /> Saved</> : "Save changes"}</button><Link className="button button--secondary" href="/profile">Cancel</Link></div>{saved && <div className="inline-success"><CheckCircle2 size={18} /><span>Your public profile was updated. Returning to your profile…</span></div>}</form>;
}
