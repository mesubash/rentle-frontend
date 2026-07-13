import { apiRequest } from "./client";
import type { RequestQuery, UUID } from "./shared";

export type PermissionResponse = {
  id: UUID;
  key: string;
  domain: string;
  resource: string;
  action: string;
  description: string;
  deprecated: boolean;
};

export type RoleResponse = {
  id: UUID;
  name: string;
  displayName: string;
  description: string | null;
  systemRole: boolean;
  permissionKeys: string[];
};

export type RoleInput = {
  displayName: string;
  description: string;
  permissionKeys: string[];
};

export type CreateRoleInput = RoleInput & { name: string };

export type AssignmentResponse = {
  id: UUID;
  userId: UUID;
  email: string;
  fullName: string;
  roleId: UUID;
  roleName: string;
  scopeId: UUID;
  scopeName: string;
  grantedBy: UUID | null;
  createdAt: string;
};

export type UserLookupResponse = {
  id: UUID;
  email: string;
  fullName: string;
  status: string;
};

export const platformApi = {
  myPermissions: () => apiRequest<string[]>("/users/me/permissions"),
  permissions: (domain?: string) =>
    apiRequest<PermissionResponse[]>("/platform/permissions", {
      query: { domain },
    }),
  roles: () => apiRequest<RoleResponse[]>("/platform/roles"),
  role: (id: UUID) => apiRequest<RoleResponse>(`/platform/roles/${id}`),
  createRole: (input: CreateRoleInput) =>
    apiRequest<RoleResponse>("/platform/roles", { method: "POST", body: input }),
  updateRole: (id: UUID, input: RoleInput) =>
    apiRequest<RoleResponse>(`/platform/roles/${id}`, {
      method: "PUT",
      body: input,
    }),
  deleteRole: (id: UUID) =>
    apiRequest<string>(`/platform/roles/${id}`, { method: "DELETE" }),
  assignments: (query: Partial<Pick<RequestQuery, "userId" | "roleId">> = {}) =>
    apiRequest<AssignmentResponse[]>("/platform/assignments", { query }),
  createAssignment: (input: { userId: UUID; roleId: UUID }) =>
    apiRequest<AssignmentResponse>("/platform/assignments", {
      method: "POST",
      body: input,
    }),
  revokeAssignment: (id: UUID) =>
    apiRequest<string>(`/platform/assignments/${id}`, { method: "DELETE" }),
  lookupUser: (email: string) =>
    apiRequest<UserLookupResponse>("/platform/users/lookup", {
      query: { email },
    }),
};
