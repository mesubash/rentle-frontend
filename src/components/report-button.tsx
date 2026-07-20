"use client";

import { useState } from "react";
import { Flag, X } from "lucide-react";
import { reportsApi, type ReportTargetType } from "@/lib/api/reports";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "./auth-provider";
import { useToast } from "./toast-provider";

/**
 * Small "Report" affordance + a bottom-sheet form (mobile-first, reuses the booking-sheet
 * pattern). Only rendered for signed-in users. Files a trust-and-safety report.
 */
export function ReportButton({
  targetType,
  targetId,
  label = "Report",
}: {
  targetType: ReportTargetType;
  targetId: string;
  label?: string;
}) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!user) return null;

  async function submit() {
    if (reason.trim().length < 4) {
      setError("Please describe the problem.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await reportsApi.create(targetType, targetId, reason.trim());
      showToast("Report submitted — our team will review it.", { tone: "success" });
      setOpen(false);
      setReason("");
    } catch (caught) {
      const message = caught instanceof ApiError ? caught.message : "Could not submit the report.";
      setError(message);
      showToast(message, { tone: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button type="button" className="report-link" onClick={() => setOpen(true)}>
        <Flag size={14} /> {label}
      </button>
      {open && (
        <div
          className="sheet-backdrop"
          role="presentation"
          onMouseDown={(event) => event.currentTarget === event.target && setOpen(false)}
        >
          <section className="booking-sheet" role="dialog" aria-modal="true" aria-labelledby="report-title">
            <header>
              <div>
                <p className="eyebrow">Trust &amp; safety</p>
                <h2 id="report-title">Report this {targetType.toLowerCase()}</h2>
              </div>
              <button className="icon-button" aria-label="Close" onClick={() => setOpen(false)}>
                <X />
              </button>
            </header>
            <div className="booking-sheet__body">
              <div className="field">
                <label htmlFor="report-reason">What&rsquo;s wrong?</label>
                <textarea
                  id="report-reason"
                  maxLength={1000}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Describe the problem — fraud, a no-show, damage, an unsafe interaction, or anything that needs attention."
                />
                <small>Our team reviews every report. Abuse of reporting may affect your account.</small>
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
            </div>
            <footer>
              <button className="button button--secondary" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="button" disabled={submitting} onClick={submit}>
                {submitting ? "Submitting…" : "Submit report"}
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
