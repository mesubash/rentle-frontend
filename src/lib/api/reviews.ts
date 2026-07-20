import { apiRequest } from "./client";
import type { PageResponse, UUID } from "./shared";

export type Review = { id: UUID; bookingId: UUID; authorId: UUID; authorName: string; subjectId: UUID; listingId: UUID; rating: number; comment: string | null; createdAt: string };
export const reviewsApi = {
  create: (bookingId: UUID, rating: number, comment?: string) => apiRequest<Review>("/reviews", { method: "POST", body: { bookingId, rating, comment } }),
  myReviewStatus: (bookingId: UUID) => apiRequest<boolean>(`/bookings/${bookingId}/my-review-status`),
  forListing: (id: UUID, page = 0, size = 20) => apiRequest<PageResponse<Review>>(`/listings/${id}/reviews`, { query: { page, size } }),
  forUser: (id: UUID, page = 0, size = 20) => apiRequest<PageResponse<Review>>(`/users/${id}/reviews`, { query: { page, size } }),
};
