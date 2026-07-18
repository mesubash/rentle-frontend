import { apiRequest } from "./client";
import type { PageResponse, UUID } from "./shared";

export type ReportTargetType = "LISTING" | "USER" | "BOOKING";
export type ReportStatus = "OPEN" | "RESOLVED" | "DISMISSED";

export type Report = {
  id: UUID;
  reporterId: UUID;
  reporterName: string;
  targetType: ReportTargetType;
  targetId: UUID;
  reason: string;
  status: ReportStatus;
  resolutionNote: string | null;
  handledBy: UUID | null;
  handledAt: string | null;
  createdAt: string;
};

export const reportsApi = {
  create: (targetType: ReportTargetType, targetId: UUID, reason: string) =>
    apiRequest<Report>("/reports", { method: "POST", body: { targetType, targetId, reason } }),
  adminList: (status?: ReportStatus, page = 0, size = 50) =>
    apiRequest<PageResponse<Report>>("/admin/reports", { query: { status, page, size } }),
  resolve: (id: UUID, status: "RESOLVED" | "DISMISSED", note?: string) =>
    apiRequest<Report>(`/admin/reports/${id}`, { method: "PUT", body: { status, note } }),
};
