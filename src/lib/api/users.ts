import { apiRequest, toFormData } from "./client";
import type { UUID } from "./shared";

export type UserProfile = {
  id: UUID;
  phoneNumber: string | null;
  email: string;
  fullName: string;
  profilePhotoUrl: string | null;
  role: "USER" | "ADMIN";
  status: "PENDING_VERIFICATION" | "VERIFIED" | "SUSPENDED";
  authProvider: "LOCAL" | "GOOGLE";
  hasPassword: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
  citizenshipVerified: boolean;
  citizenshipUploaded: boolean;
  trustScore: number;
  createdAt: string;
};

export type PublicProfile = {
  id: UUID;
  fullName: string;
  profilePhotoUrl: string | null;
  verified: boolean;
  trustScore: number;
  memberSince: string;
};

export type UpdateProfileInput = {
  fullName?: string;
  email?: string;
};

export const usersApi = {
  me: () => apiRequest<UserProfile>("/users/me"),
  updateMe: (input: UpdateProfileInput) =>
    apiRequest<UserProfile>("/users/me", { method: "PUT", body: input }),
  uploadPhoto: (file: File) =>
    apiRequest<UserProfile>("/users/me/photo", {
      method: "POST",
      body: toFormData({ file }),
    }),
  uploadCitizenship: (file: File) =>
    apiRequest<UserProfile>("/users/me/citizenship", {
      method: "POST",
      body: toFormData({ file }),
    }),
  publicProfile: (id: UUID) => apiRequest<PublicProfile>(`/users/${id}`),
  // Set (or change) the phone number and dispatch a verification code.
  setPhone: (phoneNumber: string) =>
    apiRequest<string>("/users/me/phone", { method: "POST", body: { phoneNumber } }),
  verifyPhone: (code: string) =>
    apiRequest<UserProfile>("/users/me/phone/verify", { method: "POST", body: { code } }),
  sendEmailOtp: () =>
    apiRequest<string>("/users/me/email/otp/send", { method: "POST" }),
  verifyEmail: (code: string) =>
    apiRequest<UserProfile>("/users/me/email/otp/verify", { method: "POST", body: { code } }),
};
