import { PermissionGuardedPage } from "@/components/can";
import { VerificationQueue } from "@/components/verification-queue";
import { P } from "@/lib/iam/permission-keys";

export default function AdminVerificationsPage() {
  return <PermissionGuardedPage perm={P.KYC_SUBMISSION_READ}><VerificationQueue /></PermissionGuardedPage>;
}
