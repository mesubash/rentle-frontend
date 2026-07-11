import { apiRequest, toFormData } from "./client";
import type { UUID } from "./shared";

export type UserProfile = {
  id: UUID;
  phoneNumber: string;
  email: string;
  fullName: string;
  profilePhotoUrl: string | null;
  role: "USER" | "ADMIN";
  status: "PENDING_VERIFICATION" | "VERIFIED" | "SUSPENDED";
  phoneVerified: boolean;
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
};
