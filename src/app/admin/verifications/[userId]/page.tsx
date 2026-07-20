import { PermissionGuardedPage } from "@/components/can";
import { VerificationDetail } from "@/components/verification-detail";
import { P } from "@/lib/iam/permission-keys";

export default async function AdminVerificationDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  return <PermissionGuardedPage perm={P.KYC_SUBMISSION_READ}><VerificationDetail userId={userId} /></PermissionGuardedPage>;
}
