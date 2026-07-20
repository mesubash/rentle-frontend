"use client";

import { type FormEvent, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, FileImage, ShieldCheck, Upload } from "lucide-react";
import { useAuth } from "./auth-provider";
import { useToast } from "./toast-provider";
import { kycApi, type Kyc } from "@/lib/api/kyc";
import { ApiError } from "@/lib/api/client";

const STEP_LABELS = ["Identity", "Address", "Documents"];

// Backend bean-validation errors arrive as "Validation failed: {field=message, ...}".
function parseValidation(message: string): Record<string, string> | null {
  if (!message.startsWith("Validation failed")) return null;
  const body = message.match(/\{([\s\S]+)\}/)?.[1];
  if (!body) return null;
  const map: Record<string, string> = {};
  for (const part of body.split(/,\s*/)) {
    const eq = part.indexOf("=");
    if (eq > 0) map[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
  }
  return Object.keys(map).length ? map : null;
}

function Req() {
  return <span className="req" aria-hidden="true">*</span>;
}

export function KycForm({ initial, contactReady, onDefer }: { initial: Kyc | null; contactReady: boolean; onDefer?: () => void }) {
  const { reload } = useAuth();
  const { showToast } = useToast();
  const [kyc, setKyc] = useState<Kyc | null>(initial);
  const [sameAddress, setSameAddress] = useState(false);
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);

  if (kyc?.status === "APPROVED") {
    return (
      <section className="verify-step card is-done kyc-status">
        <ShieldCheck size={22} />
        <div>
          <strong>Identity verified</strong>
          <p className="verify-step__hint">Your legal name <strong>{kyc.realName}</strong> and details are confirmed and locked.</p>
        </div>
        <CheckCircle2 size={18} className="verify-step__check" />
      </section>
    );
  }
  if (kyc?.status === "SUBMITTED") {
    return (
      <section className="verify-step card kyc-status">
        <Clock size={22} />
        <div>
          <strong>Under review</strong>
          <p className="verify-step__hint">We have your details and documents. The Rentle team will review them shortly.</p>
        </div>
      </section>
    );
  }

  const rejected = kyc?.status === "REJECTED";

  // Validate the visible step's controls before advancing.
  function next() {
    setError("");
    const active = document.getElementById(`kyc-step-${step}`);
    const controls = active ? active.querySelectorAll("input, select") : [];
    for (const el of Array.from(controls)) {
      if ((el as HTMLInputElement).checkValidity && !(el as HTMLInputElement).checkValidity()) {
        (el as HTMLInputElement).reportValidity();
        return;
      }
    }
    setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!front || !back) {
      setError("Upload clear photos of both sides of your citizenship card.");
      return;
    }
    setBusy(true);
    setError("");
    setFieldErrors({});
    const form = new FormData(event.currentTarget);
    if (sameAddress) {
      for (const f of ["District", "Municipality", "Ward", "Tole"]) {
        form.set(`temp${f}`, String(form.get(`perm${f}`) ?? ""));
      }
    }
    form.set("front", front);
    form.set("back", back);
    try {
      const saved = await kycApi.submit(form);
      setKyc(saved);
      await reload();
      showToast("Identity details submitted for review.", { tone: "success" });
    } catch (caught) {
      const message = caught instanceof ApiError ? caught.message : "We could not submit your details.";
      const parsed = caught instanceof ApiError ? parseValidation(caught.message) : null;
      if (parsed) {
        setFieldErrors(parsed);
        // Jump to the first step that has an invalid field so the errors are visible.
        setStep(Object.keys(parsed).some((key) => !/^(perm|temp)/.test(key)) ? 0 : 1);
        setError("Please fix the highlighted fields.");
        showToast("Some details need fixing before we can submit.", { tone: "error" });
      } else {
        setError(message);
        showToast(message, { tone: "error" });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="verify-step card kyc-form">
      <div className="verify-step__head"><ShieldCheck size={18} /><strong>Verify your identity (KYC)</strong></div>

      {rejected && (
        <div className="form-note form-note--warn">
          <AlertTriangle size={18} />
          <span>Your previous submission was rejected: {kyc?.rejectionReason}. Please correct and resubmit.</span>
        </div>
      )}

      {!contactReady && (
        <div className="form-note">
          <span>Verify your email and phone above before submitting your identity.</span>
        </div>
      )}

      <ol className="kyc-steps" aria-label="KYC steps">
        {STEP_LABELS.map((label, index) => (
          <li key={label} className={index === step ? "is-active" : index < step ? "is-done" : ""}>
            <span>{index + 1}</span> {label}
          </li>
        ))}
      </ol>

      <form className="form-grid" onSubmit={submit}>
        <fieldset disabled={!contactReady || busy} className="kyc-fieldset">
          <div id="kyc-step-0" hidden={step !== 0}>
            <p className="kyc-section-label">As written on your citizenship</p>
            <div className="form-grid form-grid--two">
              <Field name="realName" label="Full legal name" required defaultValue={kyc?.realName} error={fieldErrors.realName} />
              <Field name="citizenshipNumber" label="Citizenship number" required defaultValue={kyc?.citizenshipNumber} error={fieldErrors.citizenshipNumber} />
              <Field name="fatherName" label="Father's full name" required defaultValue={kyc?.fatherName} error={fieldErrors.fatherName} />
              <Field name="grandfatherName" label="Grandfather's full name" required defaultValue={kyc?.grandfatherName} error={fieldErrors.grandfatherName} />
              <Field name="dateOfBirth" label="Date of birth" type="date" required defaultValue={kyc?.dateOfBirth} error={fieldErrors.dateOfBirth} />
              <Field name="citizenshipIssueDistrict" label="Issued in district" required defaultValue={kyc?.citizenshipIssueDistrict} error={fieldErrors.citizenshipIssueDistrict} />
              <div className="field">
                <label htmlFor="gender">Gender</label>
                <select id="gender" name="gender" defaultValue={kyc?.gender ?? ""}>
                  <option value="">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <Field name="occupation" label="Occupation" required defaultValue={kyc?.occupation} error={fieldErrors.occupation} />
            </div>
          </div>

          <div id="kyc-step-1" hidden={step !== 1}>
            <p className="kyc-section-label">Permanent address</p>
            <AddressFields prefix="perm" value={kyc?.permanentAddress} errors={fieldErrors} />
            <label className="kyc-same">
              <input type="checkbox" checked={sameAddress} onChange={(e) => setSameAddress(e.target.checked)} />
              Temporary address is the same as permanent
            </label>
            {!sameAddress && (
              <>
                <p className="kyc-section-label">Temporary / current address</p>
                <AddressFields prefix="temp" value={kyc?.temporaryAddress} errors={fieldErrors} />
              </>
            )}
          </div>

          <div id="kyc-step-2" hidden={step !== 2}>
            <p className="kyc-section-label">Citizenship card photos</p>
            <div className="form-grid form-grid--two">
              <DocUpload id="front" label="Front side" required file={front} onPick={setFront} />
              <DocUpload id="back" label="Back side" required file={back} onPick={setBack} />
            </div>
            <div className="form-note">
              <ShieldCheck size={17} />
              <span>Your documents are private — used only by the verification team, never shown on your profile.</span>
            </div>
          </div>
        </fieldset>

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="kyc-nav">
          <div className="kyc-nav__secondary">
            {step > 0 && <button type="button" className="button button--secondary" disabled={busy} onClick={() => setStep(step - 1)}>Back</button>}
            {onDefer && <button type="button" className="text-button" disabled={busy} onClick={onDefer}>I&apos;ll verify later</button>}
          </div>
          {step < STEP_LABELS.length - 1 ? (
            <button type="button" className="button" disabled={!contactReady || busy} onClick={next}>Continue</button>
          ) : (
            <button className="button" disabled={!contactReady || busy}>
              {busy ? "Submitting…" : rejected ? "Resubmit for verification" : "Submit for verification"}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

function Field({
  name, label, required, type = "text", defaultValue, min, max, error,
}: { name: string; label: string; required?: boolean; type?: string; defaultValue?: string | null; min?: number; max?: number; error?: string }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label} {required && <Req />}</label>
      <input id={name} name={name} type={type} required={required} defaultValue={defaultValue ?? undefined} min={min} max={max} aria-invalid={error ? true : undefined} />
      {error && <small className="form-error-inline" role="alert">{error}</small>}
    </div>
  );
}

function AddressFields({ prefix, value, errors }: { prefix: "perm" | "temp"; value?: { district: string; municipality: string; ward: number; tole: string | null }; errors?: Record<string, string> }) {
  return (
    <div className="form-grid form-grid--two">
      <Field name={`${prefix}District`} label="District" required defaultValue={value?.district} error={errors?.[`${prefix}District`]} />
      <Field name={`${prefix}Municipality`} label="Municipality / Rural municipality" required defaultValue={value?.municipality} error={errors?.[`${prefix}Municipality`]} />
      <Field name={`${prefix}Ward`} label="Ward no. (1–35)" type="number" required min={1} max={35} defaultValue={value?.ward != null ? String(value.ward) : undefined} error={errors?.[`${prefix}Ward`]} />
      <Field name={`${prefix}Tole`} label="Tole / street" defaultValue={value?.tole ?? undefined} error={errors?.[`${prefix}Tole`]} />
    </div>
  );
}

function DocUpload({
  id, label, required, file, onPick,
}: { id: string; label: string; required?: boolean; file: File | null; onPick: (f: File | null) => void }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label} {required && <Req />}</label>
      <label className={file ? "document-upload has-file" : "document-upload"} htmlFor={id}>
        <input id={id} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
        <span>{file ? <FileImage /> : <Upload />}</span>
        <div><strong>{label}</strong><small>{file?.name || "JPG, PNG or WEBP"}</small></div>
      </label>
    </div>
  );
}
