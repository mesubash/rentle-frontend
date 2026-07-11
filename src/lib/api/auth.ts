import { apiRequest } from "./client";
import type { UserProfile } from "./users";

export type AuthSession = {
  user: UserProfile;
  expiresIn: number;
};

export type RegisterInput = {
  email: string;
  password: string;
  fullName: string;
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
  // Email-first: creates the account and starts a session immediately. Phone and
  // email are verified afterwards, before booking or listing.
  register: (input: RegisterInput) =>
    apiRequest<AuthSession>("/auth/register", { method: "POST", body: input }),
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
