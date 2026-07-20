import { apiRequest } from "./client";
import type { PageResponse, UUID } from "./shared";

export type Notification = {
  id: UUID;
  type: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export const notificationsApi = {
  list: (page = 0, size = 20) =>
    apiRequest<PageResponse<Notification>>("/notifications", {
      query: { page, size },
    }),
  unreadCount: () => apiRequest<number>("/notifications/unread-count"),
  markRead: (id: UUID) =>
    apiRequest<void>(`/notifications/${id}/read`, { method: "PUT" }),
  markAllRead: () =>
    apiRequest<void>("/notifications/read-all", { method: "PUT" }),
};
