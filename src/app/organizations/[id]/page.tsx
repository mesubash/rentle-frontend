"use client";

import { type FormEvent, use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Trash2, UserPlus } from "lucide-react";
import {
  organizationsApi, ORG_PERM,
  type Org, type OrgMember, type OrgInvite, type OrgRole,
} from "@/lib/api/organizations";
import { listingsApi, type ListingSummary } from "@/lib/api/listings";
import { bookingsApi, type Booking } from "@/lib/api/bookings";
import type { Worker } from "@/lib/api/workers";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/components/auth-provider";
import { useOrg } from "@/components/org-provider";
import { useToast } from "@/components/toast-provider";
import { SiteFooter } from "@/components/site-footer";

export default function OrganizationDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading } = useAuth();
  const { setActiveOrgId } = useOrg();
  const { showToast } = useToast();

  const [org, setOrg] = useState<Org | null>(null);
  const [error, setError] = useState("");
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [invites, setInvites] = useState<OrgInvite[]>([]);
  const [roles, setRoles] = useState<OrgRole[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const can = useCallback((key: string) => org?.myPermissions.includes(key) ?? false, [org]);

  useEffect(() => {
    if (loading || !user) return;
    let active = true;
    organizationsApi.get(id)
      .then((loaded) => {
        if (!active) return;
        setOrg(loaded);
        setActiveOrgId(loaded.id);
        const perms = loaded.myPermissions;
        if (perms.includes(ORG_PERM.MEMBER_MANAGE)) {
          organizationsApi.members(id).then((m) => active && setMembers(m)).catch(() => undefined);
          organizationsApi.invites(id).then((i) => active && setInvites(i)).catch(() => undefined);
          organizationsApi.assignableRoles(id).then((r) => active && setRoles(r)).catch(() => undefined);
        }
        if (perms.includes(ORG_PERM.WORKER_MANAGE)) {
          organizationsApi.workers(id).then((w) => active && setWorkers(w)).catch(() => undefined);
        }
        if (perms.includes(ORG_PERM.LISTING_MANAGE)) {
          listingsApi.mine(0, 50, id).then((p) => active && setListings(p.content)).catch(() => undefined);
        }
        if (perms.includes(ORG_PERM.BOOKING_MANAGE)) {
          bookingsApi.asOwner(0, 50, id).then((p) => active && setBookings(p.content)).catch(() => undefined);
        }
      })
      .catch((caught) => active && setError(caught instanceof ApiError ? caught.message : "Could not open this organization."));
    return () => { active = false; };
  }, [id, user, loading, setActiveOrgId]);

  async function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const created = await organizationsApi.invite(id, String(data.get("email")).trim(), String(data.get("roleId")));
      setInvites((cur) => [...cur.filter((i) => i.email !== created.email), created]);
      form.reset();
      showToast("Invite created. Share the link with your teammate.", { tone: "success" });
    } catch (caught) {
      showToast(caught instanceof ApiError ? caught.message : "Could not send invite.", { tone: "error" });
    }
  }

  async function revokeInvite(inviteId: string) {
    try {
      await organizationsApi.revokeInvite(id, inviteId);
      setInvites((cur) => cur.filter((i) => i.id !== inviteId));
    } catch (caught) {
      showToast(caught instanceof ApiError ? caught.message : "Could not revoke invite.", { tone: "error" });
    }
  }

  async function removeMember(member: OrgMember) {
    try {
      await organizationsApi.removeMember(id, member.userId);
      setMembers((cur) => cur.filter((m) => m.userId !== member.userId));
      showToast("Member removed.", { tone: "success" });
    } catch (caught) {
      showToast(caught instanceof ApiError ? caught.message : "Could not remove member.", { tone: "error" });
    }
  }

  async function addWorker(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const worker = await organizationsApi.addWorker(id, {
        name: String(data.get("name")).trim(),
        phone: String(data.get("phone")).trim() || undefined,
        role: String(data.get("role")).trim() || undefined,
      });
      setWorkers((cur) => [...cur, worker]);
      form.reset();
      showToast("Worker added.", { tone: "success" });
    } catch (caught) {
      showToast(caught instanceof ApiError ? caught.message : "Could not add worker.", { tone: "error" });
    }
  }

  async function removeWorker(worker: Worker) {
    try {
      await organizationsApi.removeWorker(id, worker.id);
      setWorkers((cur) => cur.filter((w) => w.id !== worker.id));
    } catch (caught) {
      showToast(caught instanceof ApiError ? caught.message : "Could not remove worker.", { tone: "error" });
    }
  }

  const inviteLink = (token: string) => `${window.location.origin}/organizations/invites/${token}`;

  if (error) {
    return (
      <main className="page"><div className="container narrow-page">
        <div className="card card-pad"><h1>Organization unavailable</h1><p className="form-note">{error}</p><Link className="button button--small" href="/">Back home</Link></div>
      </div></main>
    );
  }
  if (!org) {
    return <main className="page"><div className="container narrow-page"><p className="form-note">Loading…</p></div></main>;
  }

  return (
    <>
      <main className="page">
        <div className="container">
          <header className="trust-hero" style={{ textAlign: "left", marginBottom: 24 }}>
            <p className="eyebrow"><Building2 size={15} /> Organization</p>
            <h1>{org.name}</h1>
            {org.bio && <p>{org.bio}</p>}
          </header>

          {can(ORG_PERM.LISTING_MANAGE) && (
            <section style={{ marginBottom: 28 }}>
              <div className="section-head"><h2>Listings</h2><Link className="button button--small button--paper" href="/list">List as {org.name}</Link></div>
              {listings.length === 0 ? (
                <p className="form-note">No listings yet. Use “List as {org.name}” to publish your first one.</p>
              ) : (
                <ul className="worker-list">
                  {listings.map((l) => (
                    <li key={l.id} className="card card-pad worker-row">
                      <div><strong>{l.title}</strong><small>{l.status} · Rs {l.pricePerUnit}/{l.priceUnit.replace("PER_", "").toLowerCase()}</small></div>
                      <Link className="button button--small button--paper" href={`/listing/${l.id}`}>View</Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {can(ORG_PERM.BOOKING_MANAGE) && (
            <section style={{ marginBottom: 28 }}>
              <h2>Incoming bookings</h2>
              {bookings.length === 0 ? (
                <p className="form-note">No bookings yet.</p>
              ) : (
                <ul className="worker-list">
                  {bookings.map((b) => (
                    <li key={b.id} className="card card-pad worker-row">
                      <div><strong>{b.listingTitle}</strong><small>{b.status}{b.assignedWorkerName ? ` · ${b.assignedWorkerName}` : ""}</small></div>
                      <Link className="button button--small button--paper" href={`/bookings/${b.id}`}>Open</Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {can(ORG_PERM.WORKER_MANAGE) && (
            <section style={{ marginBottom: 28 }}>
              <h2>Workers</h2>
              <p className="form-note">People who attend bookings. Assign a worker to each booking after you approve it.</p>
              <ul className="worker-list">
                {workers.map((w) => (
                  <li key={w.id} className="card card-pad worker-row">
                    <div><strong>{w.name}</strong><small>{[w.role, w.phone].filter(Boolean).join(" · ") || "Worker"}</small></div>
                    <button className="icon-button" aria-label={`Remove ${w.name}`} onClick={() => removeWorker(w)}><Trash2 size={17} /></button>
                  </li>
                ))}
              </ul>
              <form className="card card-pad form-grid" onSubmit={addWorker} style={{ marginTop: 12 }}>
                <div className="field"><label htmlFor="w-name">Name</label><input id="w-name" name="name" required maxLength={120} /></div>
                <div className="field"><label htmlFor="w-role">Role (optional)</label><input id="w-role" name="role" maxLength={80} placeholder="e.g. Plumber" /></div>
                <div className="field"><label htmlFor="w-phone">Phone (optional)</label><input id="w-phone" name="phone" maxLength={20} /></div>
                <button className="button button--small">Add worker</button>
              </form>
            </section>
          )}

          {can(ORG_PERM.MEMBER_MANAGE) && (
            <section style={{ marginBottom: 28 }}>
              <h2>Members</h2>
              <ul className="worker-list">
                {members.map((m) => (
                  <li key={m.userId} className="card card-pad worker-row">
                    <div><strong>{m.fullName}</strong><small>{m.email} · {m.roleDisplayName}</small></div>
                    {m.userId !== user?.id && <button className="icon-button" aria-label={`Remove ${m.fullName}`} onClick={() => removeMember(m)}><Trash2 size={17} /></button>}
                  </li>
                ))}
              </ul>

              <form className="card card-pad form-grid" onSubmit={invite} style={{ marginTop: 12 }}>
                <p className="eyebrow"><UserPlus size={14} /> Invite a member</p>
                <div className="field"><label htmlFor="i-email">Email</label><input id="i-email" name="email" type="email" required maxLength={100} /></div>
                <div className="field">
                  <label htmlFor="i-role">Role</label>
                  <select id="i-role" name="roleId" required defaultValue="">
                    <option value="" disabled>Select a role</option>
                    {roles.map((r) => <option key={r.id} value={r.id}>{r.displayName}</option>)}
                  </select>
                </div>
                <button className="button button--small">Create invite</button>
              </form>

              {invites.length > 0 && (
                <ul className="worker-list" style={{ marginTop: 12 }}>
                  {invites.map((i) => (
                    <li key={i.id} className="card card-pad worker-row">
                      <div><strong>{i.email}</strong><small>{i.roleDisplayName} · <button className="link-button" onClick={() => { navigator.clipboard?.writeText(inviteLink(i.token)); showToast("Invite link copied.", { tone: "success" }); }}>Copy invite link</button></small></div>
                      <button className="icon-button" aria-label={`Revoke invite for ${i.email}`} onClick={() => revokeInvite(i.id)}><Trash2 size={17} /></button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
