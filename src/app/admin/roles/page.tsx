import { AdminRolesView } from "@/components/admin-roles-view";
import { PermissionGuardedPage } from "@/components/can";
import { P } from "@/lib/iam/permission-keys";

export default function AdminRolesPage() {
  return <PermissionGuardedPage perm={P.PLATFORM_ROLE_READ}><AdminRolesView /></PermissionGuardedPage>;
}
