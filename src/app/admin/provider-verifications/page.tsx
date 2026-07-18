import { AdminProviderVerificationsView } from "@/components/admin-provider-verifications-view";
import { PermissionGuardedPage } from "@/components/can";
import { P } from "@/lib/iam/permission-keys";

export default function AdminProviderVerificationsPage() {
  return (
    <PermissionGuardedPage perm={P.KYC_SUBMISSION_READ}>
      <AdminProviderVerificationsView />
    </PermissionGuardedPage>
  );
}
