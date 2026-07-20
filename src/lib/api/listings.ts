import { apiRequest, toFormData } from "./client";
import type { PageResponse, UUID } from "./shared";
import type { PublicProfile } from "./users";

export type ListingType = "PRODUCT" | "SERVICE";
export type ListingStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "REMOVED";
export type PriceUnit = "PER_DAY" | "PER_HOUR" | "FLAT";
export type ItemCondition = "NEW" | "GOOD" | "FAIR";
export type ServiceDuration = "HOURLY" | "HALF_DAY" | "FULL_DAY" | "CUSTOM";

export type Category = { id: UUID; parentId: UUID | null; name: string; slug: string; listingType: ListingType | "BOTH"; iconName: string | null; sortOrder: number; children: Category[] };
export type ProductDetail = { condition: ItemCondition; brand?: string; model?: string; minRentalDays?: number; maxRentalDays?: number };
export type ServiceDetail = { serviceAreaKm?: number; typicalDuration?: ServiceDuration; minNoticeHours?: number; portfolioUrl?: string };
export type ListingSearchQuery = { q?: string; type?: ListingType; categoryId?: UUID; district?: string; sort?: string; minPrice?: number; maxPrice?: number; page?: number; size?: number };
/** Who provides a listing — an individual user or an organization. Present on cards for both. */
export type ListingProvider = { type: "USER" | "ORG"; id: UUID; name: string; logoUrl: string | null; slug: string | null };
export type ListingImageItem = { id: UUID; url: string; sortOrder: number };
export type ListingSummary = { id: UUID; type: ListingType; status: ListingStatus; title: string; pricePerUnit: number; priceUnit: PriceUnit; depositAmount: number; district: string; averageRating: number; reviewCount: number; coverImage: string | null; provider: ListingProvider | null; createdAt: string };
export type ListingDetail = ListingSummary & { owner: PublicProfile; categoryId: UUID; categoryName: string; description: string; locationText: string | null; rentalTerms: string | null; totalBookings: number; images: string[]; imageItems?: ListingImageItem[]; product: ProductDetail | null; service: ServiceDetail | null };
export type CreateListingInput = { title: string; description: string; categoryId: UUID; type: ListingType; pricePerUnit: number; priceUnit: PriceUnit; district: string; locationText?: string; depositAmount?: number; rentalTerms?: string; attributes?: Record<string, unknown>; orgId?: UUID; product?: ProductDetail; service?: ServiceDetail };
export type UpdateListingInput = Partial<Omit<CreateListingInput, "categoryId" | "type"> & { status: ListingStatus }>;
export type BlockedRange = { rangeId: UUID | null; startDate: string; endDate: string; source: "OWNER_BLOCKED" | "BOOKED" };
export type Availability = { listingId: UUID; blocked: BlockedRange[] };

export const categoriesApi = {
  list: () => apiRequest<Category[]>("/categories"),
  tree: () => apiRequest<Category[]>("/categories/tree"),
};

export const listingsApi = {
  search: (query: ListingSearchQuery = {}) => apiRequest<PageResponse<ListingSummary>>("/listings", { query }),
  mine: (page = 0, size = 20, orgId?: UUID) => apiRequest<PageResponse<ListingSummary>>("/listings/me", { query: { page, size, orgId } }),
  byUser: (id: UUID, page = 0, size = 20) => apiRequest<PageResponse<ListingSummary>>(`/users/${id}/listings`, { query: { page, size } }),
  detail: (id: UUID) => apiRequest<ListingDetail>(`/listings/${id}`),
  create: (input: CreateListingInput) => apiRequest<ListingDetail>("/listings", { method: "POST", body: input }),
  update: (id: UUID, input: UpdateListingInput) => apiRequest<ListingDetail>(`/listings/${id}`, { method: "PUT", body: input }),
  remove: (id: UUID) => apiRequest<string>(`/listings/${id}`, { method: "DELETE" }),
  uploadImages: (id: UUID, files: File[]) => apiRequest<string[]>(`/listings/${id}/images`, { method: "POST", body: toFormData({ files }) }),
  deleteImage: (id: UUID, imageId: UUID) => apiRequest<string>(`/listings/${id}/images/${imageId}`, { method: "DELETE" }),
  availability: (id: UUID) => apiRequest<Availability>(`/listings/${id}/availability`),
  blockDates: (id: UUID, input: { startDate: string; endDate: string; reason?: string }) => apiRequest<Availability>(`/listings/${id}/availability`, { method: "POST", body: input }),
  unblockDates: (id: UUID, rangeId: UUID) => apiRequest<string>(`/listings/${id}/availability/${rangeId}`, { method: "DELETE" }),
};

export function priceUnitLabel(unit: PriceUnit) {
  return unit === "PER_DAY" ? "day" : unit === "PER_HOUR" ? "hour" : "booking";
}
