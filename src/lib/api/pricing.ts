import { apiRequest } from "./client";
import type { UUID } from "./shared";

export type DepositBand = {
  minValue: number; maxValue: number; depositMin: number; depositMax: number; damageCap: number | null;
};
export type CancellationTier = { hoursBefore: number; withholdPct: number };
export type PricingPolicy = {
  categoryId: UUID; depositBands: DepositBand[]; cancellationTiers: CancellationTier[];
};

export const pricingApi = {
  get: (categoryId: UUID) => apiRequest<PricingPolicy>(`/categories/${categoryId}/pricing-policy`),
  save: (categoryId: UUID, depositBands: DepositBand[], cancellationTiers: CancellationTier[]) =>
    apiRequest<PricingPolicy>(`/admin/categories/${categoryId}/pricing-policy`, {
      method: "PUT",
      body: { depositBands, cancellationTiers },
    }),
};
