import { AdminUsersView } from "@/components/admin-users-view";
import { PermissionGuardedPage } from "@/components/can";
import { P } from "@/lib/iam/permission-keys";

export default function AdminUsersPage() {
  return <PermissionGuardedPage perm={P.IDENTITY_USER_READ}><AdminUsersView /></PermissionGuardedPage>;
}
