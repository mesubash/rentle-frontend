"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { organizationsApi } from "@/lib/api/organizations";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/components/auth-provider";
import { useOrg } from "@/components/org-provider";
import { useToast } from "@/components/toast-provider";
import { SiteFooter } from "@/components/site-footer";

export default function NewOrganizationPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { setActiveOrgId, reload } = useOrg();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      const org = await organizationsApi.create({
        name: String(form.get("name")).trim(),
        bio: String(form.get("bio")).trim() || undefined,
      });
      reload();
      setActiveOrgId(org.id);
      showToast("Organization created.", { tone: "success" });
      router.push(`/organizations/${org.id}`);
    } catch (caught) {
      showToast(caught instanceof ApiError ? caught.message : "Could not create organization.", { tone: "error" });
      setSaving(false);
    }
  }

  return (
    <>
      <main className="page">
        <div className="container narrow-page">
          <header className="trust-hero" style={{ textAlign: "left", marginBottom: 24 }}>
            <p className="eyebrow"><Building2 size={15} /> Organizations</p>
            <h1>Create an organization</h1>
            <p>List products and services as a business, invite team members, and assign workers to bookings. You can switch between your personal account and this organization any time.</p>
          </header>

          {!loading && !user ? (
            <p className="form-note">Please <a href="/login">log in</a> to create an organization.</p>
          ) : (
            <form className="card card-pad form-grid" onSubmit={submit}>
              <div className="field">
                <label htmlFor="org-name">Organization name</label>
                <input id="org-name" name="name" required maxLength={120} placeholder="e.g. Kathmandu Movers" />
              </div>
              <div className="field">
                <label htmlFor="org-bio">About (optional)</label>
                <textarea id="org-bio" name="bio" maxLength={500} rows={3} placeholder="What does your organization offer?" />
              </div>
              <button className="button" disabled={saving}>{saving ? "Creating…" : "Create organization"}</button>
            </form>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
