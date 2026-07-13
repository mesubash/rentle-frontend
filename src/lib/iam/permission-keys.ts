export const P = {
  PLATFORM_ROLE_READ: "platform.role.read",
  PLATFORM_ROLE_MANAGE: "platform.role.manage",
  PLATFORM_PERMISSION_READ: "platform.permission.read",
  PLATFORM_PERMISSION_MANAGE: "platform.permission.manage",
  PLATFORM_ASSIGNMENT_READ: "platform.assignment.read",
  PLATFORM_ASSIGNMENT_MANAGE: "platform.assignment.manage",
  PLATFORM_SCOPE_READ: "platform.scope.read",
  PLATFORM_SCOPE_MANAGE: "platform.scope.manage",
  IDENTITY_USER_READ: "identity.user.read",
  IDENTITY_USER_SUSPEND: "identity.user.suspend",
  IDENTITY_USER_RESET_PASSWORD: "identity.user.reset_password",
  KYC_SUBMISSION_READ: "kyc.submission.read",
  KYC_SUBMISSION_APPROVE: "kyc.submission.approve",
  KYC_SUBMISSION_REJECT: "kyc.submission.reject",
  LISTING_LISTING_READ: "listing.listing.read",
  LISTING_LISTING_MODERATE: "listing.listing.moderate",
  LISTING_CATEGORY_MANAGE: "listing.category.manage",
  BOOKING_BOOKING_READ: "booking.booking.read",
} as const;

export type PermissionKey = (typeof P)[keyof typeof P];
