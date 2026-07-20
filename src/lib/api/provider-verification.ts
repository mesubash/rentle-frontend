import { apiRequest } from "./client";
import type { PageResponse, UUID } from "./shared";

export type ProviderVerification = {
  id: UUID;
  userId: UUID;
  orgId: UUID | null;
  categoryId: UUID;
  status: "SUBMITTED" | "APPROVED" | "REJECTED";
  fields: Record<string, unknown>;
  rejectionReason: string | null;
  createdAt: string;
};

export const providerVerificationApi = {
  submit: (categoryId: UUID, fields: Record<string, unknown>, orgId?: UUID) =>
    apiRequest<ProviderVerification>("/users/me/provider-verifications", { method: "POST", body: { categoryId, orgId, fields } }),
  mine: (orgId?: UUID) => apiRequest<ProviderVerification[]>("/users/me/provider-verifications", { query: { orgId } }),
  adminQueue: (status = "SUBMITTED", page = 0, size = 50) =>
    apiRequest<PageResponse<ProviderVerification>>("/admin/provider-verifications", { query: { status, page, size } }),
  approve: (id: UUID) => apiRequest<ProviderVerification>(`/admin/provider-verifications/${id}/approve`, { method: "PUT" }),
  reject: (id: UUID, reason: string) =>
    apiRequest<ProviderVerification>(`/admin/provider-verifications/${id}/reject`, { method: "PUT", body: { reason } }),
};
