"use client";

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, UserCog } from "lucide-react";
import { workersApi, type Worker } from "@/lib/api/workers";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/components/toast-provider";
import { SiteFooter } from "@/components/site-footer";

export default function WorkersPage() {
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    const load = user && user.accountType === "BUSINESS" ? workersApi.list() : Promise.resolve<Worker[]>([]);
    load.then(setWorkers).catch(() => undefined).finally(() => setReady(true));
  }, [user, loading]);

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      const worker = await workersApi.add({
        name: String(form.get("name")).trim(),
        phone: String(form.get("phone")).trim() || undefined,
        role: String(form.get("role")).trim() || undefined,
      });
      setWorkers((cur) => [...cur, worker]);
      (event.target as HTMLFormElement).reset();
      showToast("Worker added.", { tone: "success" });
    } catch (caught) {
      showToast(caught instanceof ApiError ? caught.message : "Could not add worker.", { tone: "error" });
    } finally { setSaving(false); }
  }

  async function remove(worker: Worker) {
    try {
      await workersApi.remove(worker.id);
      setWorkers((cur) => cur.filter((w) => w.id !== worker.id));
      showToast("Worker removed.", { tone: "success" });
    } catch (caught) {
      showToast(caught instanceof ApiError ? caught.message : "Could not remove worker.", { tone: "error" });
    }
  }

  return (
    <>
      <main className="page">
        <div className="container narrow-page">
          <header className="trust-hero" style={{ textAlign: "left", marginBottom: 24 }}>
            <p className="eyebrow">Your team</p>
            <h1>Workers</h1>
            <p>Register the people who attend bookings for your business. You can assign a worker to each booking after you approve it.</p>
          </header>
          {!ready && <p>Loading…</p>}
          {ready && (!user || user.accountType !== "BUSINESS") && (
            <section className="empty-state card">
              <UserCog size={26} />
              <h2>Switch to a business account</h2>
              <p>Workers are for business/company accounts. Turn on a business account in your profile to register workers.</p>
              <Link className="button" href="/profile/edit">Edit profile</Link>
            </section>
          )}
          {ready && user && user.accountType === "BUSINESS" && (
            <>
              <form className="card card-pad form-grid" onSubmit={add}>
                <div className="form-grid form-grid--two">
                  <div className="field"><label htmlFor="w-name">Name</label><input id="w-name" name="name" required maxLength={120} placeholder="Full name" /></div>
                  <div className="field"><label htmlFor="w-phone">Phone (optional)</label><input id="w-phone" name="phone" maxLength={20} placeholder="+9779…" /></div>
                </div>
                <div className="field"><label htmlFor="w-role">Role (optional)</label><input id="w-role" name="role" maxLength={80} placeholder="e.g. Photographer, Driver" /></div>
                <button className="button" disabled={saving}>{saving ? "Adding…" : "Add worker"}</button>
              </form>
              {workers.length === 0 ? (
                <p className="empty-note" style={{ marginTop: 16 }}>No workers yet — add your first above.</p>
              ) : (
                <ul className="worker-list">
                  {workers.map((w) => (
                    <li key={w.id} className="card card-pad worker-row">
                      <div>
                        <strong>{w.name}</strong>
                        <small>{[w.role, w.phone].filter(Boolean).join(" · ") || "No details"}</small>
                      </div>
                      <button className="icon-button" aria-label={`Remove ${w.name}`} onClick={() => remove(w)}><Trash2 size={18} /></button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
