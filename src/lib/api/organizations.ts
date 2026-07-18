import { apiRequest } from "./client";
import type { UUID } from "./shared";
import type { Worker, WorkerInput } from "./workers";

export type OrgSummary = { id: UUID; name: string; slug: string; logoUrl: string | null };

export type Org = {
  id: UUID;
  name: string;
  slug: string;
  bio: string | null;
  logoUrl: string | null;
  /** Org-scoped permission keys the current user holds here — gate UI the same as the backend. */
  myPermissions: string[];
};

export type OrgMember = {
  assignmentId: UUID;
  userId: UUID;
  fullName: string;
  email: string;
  roleId: UUID;
  roleName: string;
  roleDisplayName: string;
};

export type OrgRole = { id: UUID; name: string; displayName: string; description: string | null };

export type OrgInvite = {
  id: UUID;
  email: string;
  roleId: UUID;
  roleDisplayName: string | null;
  token: string;
  createdAt: string;
};

export type CreateOrgInput = { name: string; bio?: string; logoUrl?: string };

/** Org-scoped permission keys (mirror backend PermissionKeys — used for UI gating). */
export const ORG_PERM = {
  ORG_MANAGE: "organization.org.manage",
  MEMBER_MANAGE: "organization.member.manage",
  WORKER_MANAGE: "organization.worker.manage",
  LISTING_MANAGE: "organization.listing.manage",
  BOOKING_MANAGE: "organization.booking.manage",
} as const;

export const organizationsApi = {
  create: (input: CreateOrgInput) => apiRequest<Org>("/orgs", { method: "POST", body: input }),
  mine: () => apiRequest<OrgSummary[]>("/orgs/me"),
  get: (id: UUID) => apiRequest<Org>(`/orgs/${id}`),
  update: (id: UUID, input: CreateOrgInput) => apiRequest<Org>(`/orgs/${id}`, { method: "PUT", body: input }),

  members: (id: UUID) => apiRequest<OrgMember[]>(`/orgs/${id}/members`),
  removeMember: (id: UUID, userId: UUID) =>
    apiRequest<string>(`/orgs/${id}/members/${userId}`, { method: "DELETE" }),
  assignableRoles: (id: UUID) => apiRequest<OrgRole[]>(`/orgs/${id}/assignable-roles`),

  invites: (id: UUID) => apiRequest<OrgInvite[]>(`/orgs/${id}/members/invites`),
  invite: (id: UUID, email: string, roleId: UUID) =>
    apiRequest<OrgInvite>(`/orgs/${id}/members/invites`, { method: "POST", body: { email, roleId } }),
  revokeInvite: (id: UUID, inviteId: UUID) =>
    apiRequest<string>(`/orgs/${id}/members/invites/${inviteId}`, { method: "DELETE" }),
  acceptInvite: (token: string) =>
    apiRequest<Org>(`/orgs/invites/${token}/accept`, { method: "POST" }),

  workers: (id: UUID) => apiRequest<Worker[]>(`/orgs/${id}/workers`),
  addWorker: (id: UUID, input: WorkerInput) =>
    apiRequest<Worker>(`/orgs/${id}/workers`, { method: "POST", body: input }),
  updateWorker: (id: UUID, workerId: UUID, input: WorkerInput) =>
    apiRequest<Worker>(`/orgs/${id}/workers/${workerId}`, { method: "PUT", body: input }),
  removeWorker: (id: UUID, workerId: UUID) =>
    apiRequest<string>(`/orgs/${id}/workers/${workerId}`, { method: "DELETE" }),
};
