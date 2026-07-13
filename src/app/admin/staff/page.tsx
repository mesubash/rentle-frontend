import { AdminStaffView } from "@/components/admin-staff-view";
import { PermissionGuardedPage } from "@/components/can";
import { P } from "@/lib/iam/permission-keys";

export default function AdminStaffPage() {
  return <PermissionGuardedPage perm={P.PLATFORM_ASSIGNMENT_READ}><AdminStaffView /></PermissionGuardedPage>;
}
