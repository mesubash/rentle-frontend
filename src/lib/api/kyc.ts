import { apiRequest } from "./client";
import type { UUID } from "./shared";

export type KycStatus = "SUBMITTED" | "APPROVED" | "REJECTED";

export type KycAdminRow = {
  userId: UUID;
  currentName: string;
  realName: string;
  email: string;
  status: KycStatus;
  submittedAt: string;
};

export type KycAddress = {
  district: string;
  municipality: string;
  ward: number;
  tole: string | null;
};

export type Kyc = {
  status: KycStatus;
  realName: string;
  fatherName: string;
  grandfatherName: string;
  dateOfBirth: string;
  gender: string | null;
  citizenshipNumber: string;
  citizenshipIssueDistrict: string;
  occupation: string;
  permanentAddress: KycAddress;
  temporaryAddress: KycAddress;
  rejectionReason: string | null;
  reviewedAt: string | null;
  submittedAt: string;
};

export const kycApi = {
  // Current user's KYC record, or null if never submitted.
  mine: () => apiRequest<Kyc | null>("/users/me/kyc"),
  // Multipart FormData: all identity fields + `front` and `back` image files.
  submit: (form: FormData) => apiRequest<Kyc>("/users/me/kyc", { method: "POST", body: form }),
};
