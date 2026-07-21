import { apiRequest, toFormData } from "./client";
import type { PageResponse, UUID } from "./shared";

export type BookingStatus = "REQUESTED" | "APPROVED" | "DEPOSIT_PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "REJECTED";
export type BookingConditionPhase = "CHECKOUT" | "RETURN";
export type Booking = { id: UUID; listingId: UUID; listingTitle: string; coverImage: string | null; listingType: "PRODUCT" | "SERVICE"; ownerId: UUID; ownerName: string; ownerPaymentWallet: string | null; renterId: UUID; renterName: string; startDate: string; endDate: string; startTime: string | null; endTime: string | null; status: BookingStatus; totalPrice: number; depositAmount: number; depositPaid: boolean; depositProofUrl: string | null; agreedTerms: string | null; hasCheckoutCondition: boolean; checkoutNote: string | null; hasReturnCondition: boolean; returnNote: string | null; renterNote: string | null; platformFeeAmount: number | null; feeInvoiced: boolean; assignedWorkerId: UUID | null; assignedWorkerName: string | null; cancellationReason: string | null; createdAt: string };
export type CreateBookingInput = { listingId: UUID; startDate: string; endDate: string; startTime?: string; endTime?: string; note?: string; attributes?: Record<string, unknown> };

export const bookingsApi = {
  create: (input: CreateBookingInput) => apiRequest<Booking>("/bookings", { method: "POST", body: input }),
  asRenter: (page = 0, size = 20) => apiRequest<PageResponse<Booking>>("/bookings/me/as-renter", { query: { page, size } }),
  asOwner: (page = 0, size = 20, orgId?: string) => apiRequest<PageResponse<Booking>>("/bookings/me/as-owner", { query: { page, size, orgId } }),
  detail: (id: UUID) => apiRequest<Booking>(`/bookings/${id}`),
  approve: (id: UUID) => apiRequest<Booking>(`/bookings/${id}/approve`, { method: "POST" }),
  assignWorker: (id: UUID, workerId?: UUID) => apiRequest<Booking>(`/bookings/${id}/assign-worker`, { method: "POST", query: workerId ? { workerId } : {} }),
  reject: (id: UUID, reason?: string) => apiRequest<Booking>(`/bookings/${id}/reject`, { method: "POST", body: { reason } }),
  uploadDeposit: (id: UUID, file: File) => apiRequest<Booking>(`/bookings/${id}/deposit`, { method: "POST", body: toFormData({ file }) }),
  recordCondition: (id: UUID, phase: BookingConditionPhase, file: File, note?: string) => apiRequest<Booking>(`/bookings/${id}/condition`, { method: "POST", body: toFormData({ phase, file, ...(note ? { note } : {}) }) }),
  confirmDeposit: (id: UUID) => apiRequest<Booking>(`/bookings/${id}/confirm-deposit`, { method: "POST" }),
  complete: (id: UUID) => apiRequest<Booking>(`/bookings/${id}/complete`, { method: "POST" }),
  cancel: (id: UUID, reason?: string) => apiRequest<Booking>(`/bookings/${id}/cancel`, { method: "POST", body: { reason } }),
};
