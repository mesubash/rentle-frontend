import { PermissionGuardedPage } from "@/components/can";
import { AdminOrganizationsView } from "@/components/admin-organizations-view";
import { P } from "@/lib/iam/permission-keys";

export default function AdminOrganizationsPage() {
  return <PermissionGuardedPage perm={P.PLATFORM_ORGANIZATION_READ}><AdminOrganizationsView /></PermissionGuardedPage>;
}
