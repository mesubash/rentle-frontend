import { apiRequest } from "./client";
import type { ListingSummary } from "./listings";
import type { UUID } from "./shared";

export const favoritesApi = {
  toggle: (listingId: UUID) =>
    apiRequest<{ saved: boolean }>(`/listings/${listingId}/favorite`, { method: "POST" }),
  ids: () => apiRequest<UUID[]>("/users/me/favorite-ids"),
  list: () => apiRequest<ListingSummary[]>("/users/me/favorites"),
};
