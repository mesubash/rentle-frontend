import { apiRequest } from "./client";
import type { UserProfile } from "./users";

export type AuthSession = {
  user: UserProfile;
  expiresIn: number;
};

export type RegisterInput = {
  phoneNumber: string;
  email: string;
  password: string;
  fullName: string;
};

export type LoginInput = {
  identifier: string;
  password: string;
};

export const authApi = {
  register: (input: RegisterInput) =>
    apiRequest<AuthSession>("/auth/register", { method: "POST", body: input }),
  login: (input: LoginInput) =>
    apiRequest<AuthSession>("/auth/login", { method: "POST", body: input }),
  google: (idToken: string) =>
    apiRequest<AuthSession>("/auth/google", { method: "POST", body: { idToken } }),
  refresh: () => apiRequest<AuthSession>("/auth/refresh", { method: "POST" }),
  logout: () => apiRequest<string>("/auth/logout", { method: "POST" }),
  sendOtp: (phoneNumber: string) =>
    apiRequest<string>("/auth/otp/send", {
      method: "POST",
      body: { phoneNumber },
    }),
  verifyOtp: (phoneNumber: string, code: string) =>
    apiRequest<string>("/auth/otp/verify", {
      method: "POST",
      body: { phoneNumber, code },
    }),
};
