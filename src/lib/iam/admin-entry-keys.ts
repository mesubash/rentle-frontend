import { P, type PermissionKey } from "./permission-keys";

export const ADMIN_ENTRY_KEYS = [
  P.IDENTITY_USER_READ,
  P.KYC_SUBMISSION_READ,
  P.LISTING_LISTING_READ,
  P.BOOKING_BOOKING_READ,
  P.PLATFORM_ROLE_READ,
  P.PLATFORM_ASSIGNMENT_READ,
] as const satisfies readonly PermissionKey[];
