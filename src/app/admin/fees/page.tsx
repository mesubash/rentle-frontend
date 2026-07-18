import { AdminFeesView } from "@/components/admin-fees-view";
import { PermissionGuardedPage } from "@/components/can";
import { P } from "@/lib/iam/permission-keys";

export default function AdminFeesPage() {
  return (
    <PermissionGuardedPage perm={P.BOOKING_FEE_MANAGE}>
      <AdminFeesView />
    </PermissionGuardedPage>
  );
}
