"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, FileImage, MessageCircle, Upload } from "lucide-react";

export function BookingActions({ bookingId = "RNT-8924", owner = "Sarah", amount = "NPR 30,000", requested = false }: { bookingId?: string; owner?: string; amount?: string; requested?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<string>();
  const [saved, setSaved] = useState(false);

  return (
    <section className="card booking-action-card">
      <p className="eyebrow">Your next step</p>
      <h2>Upload deposit proof</h2>
      <p>Send <strong>{amount}</strong> directly to {owner} using eSewa or Khalti. Then attach a screenshot here.</p>
      <div className={file ? "upload-box has-file" : "upload-box"}>
        {file ? <><FileImage size={25} /><div><strong>{file}</strong><small>Ready to attach to booking #{bookingId}</small></div></> : <><Upload size={25} /><div><strong>Add payment screenshot</strong><small>PNG, JPG, or WEBP up to 5MB</small></div></>}
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { setFile(event.target.files?.[0]?.name); setSaved(false); }} />
        <button className="button button--secondary button--small" onClick={() => inputRef.current?.click()}>{file ? "Choose another" : "Select file"}</button>
      </div>
      <div className="button-row"><button className="button" disabled={!file || saved} onClick={() => setSaved(true)}>{saved ? <><CheckCircle2 size={17} /> Proof uploaded</> : "Upload proof"}</button><Link className="button button--secondary" href={`/messages/${bookingId}`}><MessageCircle size={17} /> Message {owner}</Link></div>
      {saved && <div className="inline-success"><CheckCircle2 size={18} /><span>{owner} has been notified. They will confirm receipt before the booking becomes active.</span></div>}
      {requested && !saved && <div className="inline-success"><CheckCircle2 size={18} /><span>Your request was sent. {owner} approved it, so the deposit step is now ready.</span></div>}
    </section>
  );
}
