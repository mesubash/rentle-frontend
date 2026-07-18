import { apiRequest } from "./client";
import type { Booking } from "./bookings";
import type { Kyc, KycAdminRow } from "./kyc";
import type { ListingSummary } from "./listings";
import type { PageResponse, UUID } from "./shared";
import type { UserProfile } from "./users";

export type AdminCategory = {
  id: UUID;
  name: string;
  slug: string;
  listingType: "PRODUCT" | "SERVICE" | "BOTH";
  iconName: string | null;
  sortOrder: number;
  active: boolean;
  listingCount: number;
};

/** Admin-served citizenship image (proxied through the BFF with the admin cookie). */
export function citizenshipImageUrl(userId: UUID, side: "front" | "back") {
  return `/api/rentle/admin/users/${userId}/citizenship?side=${side}`;
}

export const adminApi = {
  users: (status?: UserProfile["status"], page = 0, size = 100) => apiRequest<PageResponse<UserProfile>>("/admin/users", { query: { status, page, size } }),
  suspend: (id: UUID) => apiRequest<UserProfile>(`/admin/users/${id}/suspend`, { method: "PUT" }),
  unsuspend: (id: UUID) => apiRequest<UserProfile>(`/admin/users/${id}/unsuspend`, { method: "PUT" }),
  resetPassword: (id: UUID, password: string) =>
    apiRequest<string>(`/admin/users/${id}/password`, { method: "PUT", body: { password } }),
  // KYC review
  kycQueue: (page = 0, size = 50) => apiRequest<PageResponse<KycAdminRow>>("/admin/kyc", { query: { page, size } }),
  kycDetail: (userId: UUID) => apiRequest<Kyc>(`/admin/kyc/${userId}`),
  approveKyc: (userId: UUID) => apiRequest<Kyc>(`/admin/users/${userId}/verify`, { method: "PUT" }),
  rejectKyc: (userId: UUID, reason: string) =>
    apiRequest<Kyc>(`/admin/users/${userId}/reject-kyc`, { method: "PUT", body: { reason } }),
  bookings: (page = 0, size = 100) => apiRequest<PageResponse<Booking>>("/admin/bookings", { query: { page, size } }),
  booking: (id: UUID) => apiRequest<Booking>(`/admin/bookings/${id}`),
  listings: (page = 0, size = 100) => apiRequest<PageResponse<ListingSummary>>("/admin/listings", { query: { page, size } }),
  deactivateListing: (id: UUID, reason: string) =>
    apiRequest<ListingSummary>(`/admin/listings/${id}/deactivate`, {
      method: "PUT",
      body: { reason },
    }),
  removeListing: (id: UUID, reason: string) =>
    apiRequest<ListingSummary>(`/admin/listings/${id}/remove`, {
      method: "PUT",
      body: { reason },
    }),
  // Category launch/pause (gradual rollout)
  categories: () => apiRequest<AdminCategory[]>("/admin/categories"),
  setCategoryStatus: (id: UUID, active: boolean) =>
    apiRequest<AdminCategory>(`/admin/categories/${id}/status`, { method: "PUT", body: { active } }),
  // Platform settings + fee ledger
  settings: () => apiRequest<Record<string, string>>("/admin/settings"),
  updateSetting: (key: string, value: string) =>
    apiRequest<Record<string, string>>(`/admin/settings/${key}`, { method: "PUT", body: { value } }),
  fees: (invoiced = false, page = 0, size = 50) =>
    apiRequest<PageResponse<Booking>>("/admin/fees", { query: { invoiced, page, size } }),
  markFeeInvoiced: (id: UUID) =>
    apiRequest<Booking>(`/admin/bookings/${id}/fee-invoiced`, { method: "PUT" }),
};
