import { apiRequest } from "./client";
import type { UUID } from "./shared";

export type Worker = { id: UUID; name: string; phone: string | null; role: string | null; active: boolean };
export type WorkerInput = { name: string; phone?: string; role?: string };

export const workersApi = {
  list: () => apiRequest<Worker[]>("/users/me/workers"),
  add: (input: WorkerInput) => apiRequest<Worker>("/users/me/workers", { method: "POST", body: input }),
  update: (id: UUID, input: WorkerInput) => apiRequest<Worker>(`/users/me/workers/${id}`, { method: "PUT", body: input }),
  remove: (id: UUID) => apiRequest<string>(`/users/me/workers/${id}`, { method: "DELETE" }),
};
