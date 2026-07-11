import { apiRequest } from "./client";
import type { Booking } from "./bookings";
import type { Kyc, KycAdminRow } from "./kyc";
import type { ListingSummary } from "./listings";
import type { PageResponse, UUID } from "./shared";
import type { UserProfile } from "./users";

/** Admin-served citizenship image (proxied through the BFF with the admin cookie). */
export function citizenshipImageUrl(userId: UUID, side: "front" | "back") {
  return `/api/rentle/admin/users/${userId}/citizenship?side=${side}`;
}

export const adminApi = {
  users: (status?: UserProfile["status"], page = 0, size = 100) => apiRequest<PageResponse<UserProfile>>("/admin/users", { query: { status, page, size } }),
  suspend: (id: UUID) => apiRequest<UserProfile>(`/admin/users/${id}/suspend`, { method: "PUT" }),
  unsuspend: (id: UUID) => apiRequest<UserProfile>(`/admin/users/${id}/unsuspend`, { method: "PUT" }),
  // KYC review
  kycQueue: (page = 0, size = 50) => apiRequest<PageResponse<KycAdminRow>>("/admin/kyc", { query: { page, size } }),
  kycDetail: (userId: UUID) => apiRequest<Kyc>(`/admin/kyc/${userId}`),
  approveKyc: (userId: UUID) => apiRequest<Kyc>(`/admin/users/${userId}/verify`, { method: "PUT" }),
  rejectKyc: (userId: UUID, reason: string) =>
    apiRequest<Kyc>(`/admin/users/${userId}/reject-kyc`, { method: "PUT", body: { reason } }),
  bookings: (page = 0, size = 100) => apiRequest<PageResponse<Booking>>("/admin/bookings", { query: { page, size } }),
  listings: (page = 0, size = 100) => apiRequest<PageResponse<ListingSummary>>("/admin/listings", { query: { page, size } }),
};
