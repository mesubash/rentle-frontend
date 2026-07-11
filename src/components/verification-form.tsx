"use client";

import { useRef, useState, type RefObject } from "react";
import { CheckCircle2, FileImage, LockKeyhole, Upload } from "lucide-react";

function UploadBox({ label, value, inputRef, onChange }: { label: string; value: string; inputRef: RefObject<HTMLInputElement | null>; onChange: (value: string) => void }) {
  return <div className={value ? "document-upload has-file" : "document-upload"}><input ref={inputRef} type="file" accept="image/*" onChange={(event) => onChange(event.target.files?.[0]?.name ?? "")} /><span>{value ? <FileImage /> : <Upload />}</span><div><strong>{label}</strong><small>{value || "JPG, PNG or WEBP · clear and uncropped"}</small></div><button className="button button--secondary button--small" type="button" onClick={() => inputRef.current?.click()}>{value ? "Replace" : "Choose photo"}</button></div>;
}

export function VerificationForm() {
  const frontRef = useRef<HTMLInputElement>(null); const backRef = useRef<HTMLInputElement>(null);
  const [front, setFront] = useState(""); const [back, setBack] = useState(""); const [submitted, setSubmitted] = useState(false);
  const [number, setNumber] = useState(""); const [district, setDistrict] = useState("");
  if (submitted) return <section className="verification-success card"><CheckCircle2 size={34} /><p className="eyebrow">Submitted for review</p><h1>We have your documents.</h1><p>An admin usually reviews citizenship cards within one business day. You can keep browsing while you wait.</p><span className="status-chip status-chip--requested">Review pending</span></section>;
  return <section className="verification-form card"><header><p className="eyebrow">Identity verification</p><h1>Verify your citizenship</h1><p>A clear citizenship card helps owners know they are dealing with a real person.</p></header><div className="form-note"><LockKeyhole size={18} /><span>Your document is encrypted and visible only to the small Rentle verification team. It is never shown on your public profile.</span></div><div className="form-grid"><UploadBox label="Citizenship card — front" value={front} inputRef={frontRef} onChange={setFront} /><UploadBox label="Citizenship card — back" value={back} inputRef={backRef} onChange={setBack} /><div className="field"><label htmlFor="citizenship-number">Citizenship number</label><input id="citizenship-number" value={number} onChange={(event) => setNumber(event.target.value)} placeholder="e.g. 27-01-78-01234" required /><small>Enter the number exactly as it appears on the card.</small></div><div className="field"><label htmlFor="issued-district">Issued district</label><select id="issued-district" value={district} onChange={(event) => setDistrict(event.target.value)} required><option value="" disabled>Select district</option><option>Kathmandu</option><option>Lalitpur</option><option>Bhaktapur</option><option>Kaski</option></select></div></div><button className="button button--wide" disabled={!front || !back || !number.trim() || !district} onClick={() => setSubmitted(true)}>Submit for verification</button></section>;
}
