"use client";

import { useRef, useState } from "react";
import { CheckCircle2, FileImage, LockKeyhole, Upload } from "lucide-react";
import { useAuth } from "./auth-provider";
import { ApiError } from "@/lib/api/client";
import { usersApi } from "@/lib/api/users";

export function VerificationForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, setUser } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(Boolean(user?.citizenshipUploaded));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!file) return;
    setLoading(true); setError("");
    try {
      const profile = await usersApi.uploadCitizenship(file);
      setUser(profile); setSubmitted(true);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "We could not upload your document.");
    } finally { setLoading(false); }
  }

  if (submitted) return <section className="verification-success card"><CheckCircle2 size={34} /><p className="eyebrow">Submitted for review</p><h1>We have your document.</h1><p>You can keep browsing while the Rentle team reviews it.</p><span className="status-chip status-chip--requested">Review pending</span></section>;

  const contactReady = Boolean(user?.phoneVerified && user?.emailVerified);

  return <section className="verification-form card"><header><p className="eyebrow">Identity verification</p><h1>Verify your citizenship</h1><p>Upload one clear image showing the full citizenship card.</p></header><div className="form-note"><LockKeyhole size={18} /><span>Your document is used only by the verification team and is never shown on your public profile.</span></div>{!contactReady && <div className="form-note"><span>Verify your email and phone above before submitting your ID.</span></div>}<div className="form-grid"><div className={file ? "document-upload has-file" : "document-upload"}><input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" disabled={!contactReady} onChange={(event) => setFile(event.target.files?.[0] ?? null)} /><span>{file ? <FileImage /> : <Upload />}</span><div><strong>Citizenship card</strong><small>{file?.name || "JPG, PNG or WEBP · clear and uncropped"}</small></div><button className="button button--secondary button--small" type="button" disabled={!contactReady} onClick={() => inputRef.current?.click()}>{file ? "Replace" : "Choose photo"}</button></div></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button--wide" disabled={!file || loading || !contactReady} onClick={submit}>{loading ? "Uploading…" : "Submit for verification"}</button></section>;
}
