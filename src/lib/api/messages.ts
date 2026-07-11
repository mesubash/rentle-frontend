import { apiRequest } from "./client";
import type { PageResponse, UUID } from "./shared";

export type Message = { id: UUID; bookingId: UUID; senderId: UUID; senderName: string; content: string; isRead: boolean; readAt: string | null; createdAt: string };
export const messagesApi = {
  list: (bookingId: UUID, page = 0, size = 100) => apiRequest<PageResponse<Message>>(`/bookings/${bookingId}/messages`, { query: { page, size } }),
  send: (bookingId: UUID, content: string) => apiRequest<Message>(`/bookings/${bookingId}/messages`, { method: "POST", body: { content } }),
  markRead: (bookingId: UUID) => apiRequest<number>(`/bookings/${bookingId}/messages/read`, { method: "PUT" }),
};
