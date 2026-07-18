import { AdminReportsView } from "@/components/admin-reports-view";
import { PermissionGuardedPage } from "@/components/can";
import { P } from "@/lib/iam/permission-keys";

export default function AdminReportsPage() {
  return (
    <PermissionGuardedPage perm={P.TRUST_REPORT_READ}>
      <AdminReportsView />
    </PermissionGuardedPage>
  );
}
