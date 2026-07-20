"use client";

import { type FormEvent, use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Check, Trash2, UserPlus } from "lucide-react";
import {
  organizationsApi, ORG_PERM,
  type Org, type OrgMember, type OrgInvite, type OrgRole,
} from "@/lib/api/organizations";
import { listingsApi, type ListingSummary } from "@/lib/api/listings";
import { bookingsApi, type Booking } from "@/lib/api/bookings";
import type { Worker } from "@/lib/api/workers";
import { ApiError } from "@/lib/api/client";
import { NepalPhoneInput } from "@/components/nepal-phone-input";
import { toNepalInternationalPhone } from "@/lib/phone";
import { useAuth } from "@/components/auth-provider";
import { useOrg } from "@/components/org-provider";
import { useToast } from "@/components/toast-provider";
import { SiteFooter } from "@/components/site-footer";

export default function OrganizationDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading } = useAuth();
  const { activeOrgId, setActiveOrgId, reload: reloadOrgs } = useOrg();
  const { showToast } = useToast();

  const [org, setOrg] = useState<Org | null>(null);
  const [editing, setEditing] = useState(false);
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
  }, [id, user, loading]);

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
    const localPhone = String(data.get("phone")).trim();
    try {
      const worker = await organizationsApi.addWorker(id, {
        name: String(data.get("name")).trim(),
        phone: localPhone ? toNepalInternationalPhone(localPhone) : undefined,
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

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const updated = await organizationsApi.update(id, {
        name: String(data.get("name")).trim(),
        bio: String(data.get("bio")).trim() || undefined,
      });
      setOrg(updated);
      setEditing(false);
      reloadOrgs();
      showToast("Organization updated.", { tone: "success" });
    } catch (caught) {
      showToast(caught instanceof ApiError ? caught.message : "Could not update organization.", { tone: "error" });
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
          <header className="trust-hero" style={{ textAlign: "left", marginBottom: 20 }}>
            <p className="eyebrow"><Building2 size={15} /> Organization</p>
            {editing ? (
              <form className="card card-pad form-grid" onSubmit={saveProfile} style={{ marginTop: 8 }}>
                <div className="field"><label htmlFor="org-name">Name</label><input id="org-name" name="name" required maxLength={120} defaultValue={org.name} /></div>
                <div className="field"><label htmlFor="org-bio">About</label><textarea id="org-bio" name="bio" maxLength={500} rows={3} defaultValue={org.bio ?? ""} /></div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="button button--small">Save</button>
                  <button type="button" className="button button--small button--paper" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <h1>{org.name}</h1>
                {org.bio && <p>{org.bio}</p>}
                <p className="org-acting">
                  {activeOrgId === org.id ? (
                    <><Check size={15} /> You are acting as {org.name}</>
                  ) : (
                    <button className="button button--small button--secondary" onClick={() => setActiveOrgId(org.id)}>
                      Act as {org.name}
                    </button>
                  )}
                </p>
                {can(ORG_PERM.ORG_MANAGE) && <button className="link-button" onClick={() => setEditing(true)} style={{ marginTop: 4 }}>Edit organization</button>}
              </>
            )}
          </header>

          <div className="org-stats">
            {can(ORG_PERM.LISTING_MANAGE) && <span className="org-stat"><strong>{listings.length}</strong><small>Listings</small></span>}
            {can(ORG_PERM.BOOKING_MANAGE) && <span className="org-stat"><strong>{bookings.length}</strong><small>Bookings</small></span>}
            {can(ORG_PERM.WORKER_MANAGE) && <span className="org-stat"><strong>{workers.length}</strong><small>Workers</small></span>}
            {can(ORG_PERM.MEMBER_MANAGE) && <span className="org-stat"><strong>{members.length}</strong><small>Members</small></span>}
          </div>

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
                <div className="field"><label htmlFor="w-phone">Phone (optional)</label><NepalPhoneInput id="w-phone" name="phone" autoComplete="tel-national" placeholder="98XXXXXXXX" pattern="[0-9]{7,10}" /></div>
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
