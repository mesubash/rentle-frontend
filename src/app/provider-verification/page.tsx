"use client";

import { useEffect, useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { categoriesApi, type Category } from "@/lib/api/listings";
import { templatesApi, type FieldDefinition } from "@/lib/api/templates";
import { providerVerificationApi, type ProviderVerification } from "@/lib/api/provider-verification";
import { ApiError } from "@/lib/api/client";
import { DynamicFields } from "@/components/dynamic-fields";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/components/toast-provider";
import { SiteFooter } from "@/components/site-footer";

export default function ProviderVerificationPage() {
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [mine, setMine] = useState<ProviderVerification[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    categoriesApi.list().then((all) => setCategories(all.filter((c) => c.listingType !== "PRODUCT"))).catch(() => undefined);
  }, []);
  useEffect(() => {
    if (loading || !user) return;
    providerVerificationApi.mine().then(setMine).catch(() => undefined);
  }, [user, loading]);
  useEffect(() => {
    let active = true;
    const load = categoryId ? templatesApi.current(categoryId, "VERIFICATION") : Promise.resolve(null);
    load.then((tpl) => { if (active) setFields(tpl?.fields ?? []); }).catch(() => { if (active) setFields([]); });
    return () => { active = false; };
  }, [categoryId]);

  const statusById = useMemo(() => Object.fromEntries(mine.map((m) => [m.categoryId, m])), [mine]);

  async function submit() {
    if (!categoryId) return;
    setSubmitting(true);
    try {
      const v = await providerVerificationApi.submit(categoryId, values);
      setMine((cur) => [...cur.filter((m) => m.categoryId !== categoryId), v]);
      setValues({});
      showToast("Verification submitted for review.", { tone: "success" });
    } catch (caught) {
      showToast(caught instanceof ApiError ? caught.message : "Could not submit.", { tone: "error" });
    } finally { setSubmitting(false); }
  }

  return (
    <>
      <main className="page">
        <div className="container narrow-page">
          <header className="trust-hero" style={{ textAlign: "left", marginBottom: 24 }}>
            <p className="eyebrow">For service providers</p>
            <h1>Provider verification</h1>
            <p>Some service categories require credentials before you can list. Submit them here for review.</p>
          </header>

          <section className="card card-pad form-grid">
            <div className="field">
              <label htmlFor="pv-category">Service category</label>
              <select id="pv-category" value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setValues({}); }}>
                <option value="">Select a category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {categoryId && fields.length === 0 && <p className="form-note"><ShieldCheck size={17} /><span>This category needs no extra credentials — identity verification is enough.</span></p>}
            {fields.length > 0 && (
              <>
                {statusById[categoryId] && <p className={`form-note ${statusById[categoryId].status === "REJECTED" ? "form-error" : ""}`}><span>Current status: <strong>{statusById[categoryId].status}</strong>{statusById[categoryId].rejectionReason ? ` — ${statusById[categoryId].rejectionReason}` : ""}</span></p>}
                <DynamicFields fields={fields} values={values} onChange={(k, v) => setValues((cur) => ({ ...cur, [k]: v }))} idPrefix="pv" />
                <button className="button" disabled={submitting} onClick={submit}>{submitting ? "Submitting…" : "Submit for review"}</button>
              </>
            )}
          </section>

          {mine.length > 0 && (
            <section style={{ marginTop: 24 }}>
              <h2>Your submissions</h2>
              <ul className="worker-list">
                {mine.map((m) => {
                  const cat = categories.find((c) => c.id === m.categoryId);
                  return <li key={m.id} className="card card-pad worker-row"><div><strong>{cat?.name ?? "Category"}</strong><small>{m.status}{m.rejectionReason ? ` · ${m.rejectionReason}` : ""}</small></div></li>;
                })}
              </ul>
            </section>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
