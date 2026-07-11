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

export type RegistrationPending = {
  phoneNumber: string;
  otpRequired: boolean;
  expiresInSeconds: number;
  message: string;
};

export type LoginInput = {
  identifier: string;
  password: string;
};

export type GoogleStatus = {
  enabled: boolean;
  loginUrl: string;
};

export const authApi = {
  // Step 1 — does not create the account; sends a phone OTP.
  register: (input: RegisterInput) =>
    apiRequest<RegistrationPending>("/auth/register", { method: "POST", body: input }),
  // Step 2 — verify the OTP to create the account and start a session.
  completeRegistration: (phoneNumber: string, code: string) =>
    apiRequest<AuthSession>("/auth/register/verify", {
      method: "POST",
      body: { phoneNumber, code },
    }),
  resendRegistration: (phoneNumber: string) =>
    apiRequest<string>("/auth/register/resend", { method: "POST", body: { phoneNumber } }),
  login: (input: LoginInput) =>
    apiRequest<AuthSession>("/auth/login", { method: "POST", body: input }),
  refresh: () => apiRequest<AuthSession>("/auth/refresh", { method: "POST" }),
  logout: () => apiRequest<string>("/auth/logout", { method: "POST" }),
  // Backend-driven Google OAuth: the frontend only reads whether it's enabled
  // and swaps the one-time handoff code (from the redirect) for a session.
  googleStatus: () => apiRequest<GoogleStatus>("/auth/google/status"),
  googleExchange: (code: string) =>
    apiRequest<AuthSession>("/auth/google/exchange", { method: "POST", body: { code } }),
};
