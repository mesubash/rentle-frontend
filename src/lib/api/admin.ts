import { apiRequest } from "./client";
import type { Booking } from "./bookings";
import type { ListingSummary } from "./listings";
import type { PageResponse, UUID } from "./shared";
import type { UserProfile } from "./users";

export const adminApi = {
  users: (status?: UserProfile["status"], page = 0, size = 100) => apiRequest<PageResponse<UserProfile>>("/admin/users", { query: { status, page, size } }),
  verify: (id: UUID) => apiRequest<UserProfile>(`/admin/users/${id}/verify`, { method: "PUT" }),
  suspend: (id: UUID) => apiRequest<UserProfile>(`/admin/users/${id}/suspend`, { method: "PUT" }),
  unsuspend: (id: UUID) => apiRequest<UserProfile>(`/admin/users/${id}/unsuspend`, { method: "PUT" }),
  bookings: (page = 0, size = 100) => apiRequest<PageResponse<Booking>>("/admin/bookings", { query: { page, size } }),
  listings: (page = 0, size = 100) => apiRequest<PageResponse<ListingSummary>>("/admin/listings", { query: { page, size } }),
};
