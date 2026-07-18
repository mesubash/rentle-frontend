import { apiRequest, toFormData } from "./client";
import type { UUID } from "./shared";
import type { KycStatus } from "./kyc";

export type UserProfile = {
  id: UUID;
  phoneNumber: string | null;
  email: string;
  fullName: string;
  paymentWallet: string | null;
  profilePhotoUrl: string | null;
  status: "PENDING_VERIFICATION" | "VERIFIED" | "SUSPENDED";
  authProvider: "LOCAL" | "GOOGLE";
  hasPassword: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
  citizenshipVerified: boolean;
  kycStatus: KycStatus | null;
  trustScore: number;
  accountType: "INDIVIDUAL" | "BUSINESS";
  businessName: string | null;
  createdAt: string;
};

export type PublicProfile = {
  id: UUID;
  fullName: string;
  profilePhotoUrl: string | null;
  verified: boolean;
  trustScore: number;
  accountType: "INDIVIDUAL" | "BUSINESS";
  businessName: string | null;
  memberSince: string;
};

export type UpdateProfileInput = {
  fullName?: string;
  email?: string;
  paymentWallet?: string | null;
  accountType?: "INDIVIDUAL" | "BUSINESS";
  businessName?: string | null;
};

export const usersApi = {
  // Profile bootstrap is an authentication probe, not an authorization action.
  // A stale session must resolve to a guest without showing an access-denied toast.
  me: () => apiRequest<UserProfile>("/users/me", { suppressForbiddenHandler: true }),
  updateMe: (input: UpdateProfileInput) =>
    apiRequest<UserProfile>("/users/me", { method: "PUT", body: input }),
  uploadPhoto: (file: File) =>
    apiRequest<UserProfile>("/users/me/photo", {
      method: "POST",
      body: toFormData({ file }),
    }),
  publicProfile: (id: UUID) => apiRequest<PublicProfile>(`/users/${id}`),
  // Set (or change) the phone number and dispatch an SMS OTP.
  setPhone: (phoneNumber: string) =>
    apiRequest<string>("/users/me/phone", { method: "POST", body: { phoneNumber } }),
  verifyPhone: (code: string) =>
    apiRequest<UserProfile>("/users/me/phone/verify", { method: "POST", body: { code } }),
  // Email is verified by opening a link; this (re)sends that link.
  sendEmailVerification: () =>
    apiRequest<string>("/users/me/email/verify/send", { method: "POST" }),
};
