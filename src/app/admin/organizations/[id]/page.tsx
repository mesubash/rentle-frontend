import { PermissionGuardedPage } from "@/components/can";
import { AdminOrganizationDetail } from "@/components/admin-organization-detail";
import { P } from "@/lib/iam/permission-keys";

export default async function AdminOrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PermissionGuardedPage perm={P.PLATFORM_ORGANIZATION_READ}><AdminOrganizationDetail id={id} /></PermissionGuardedPage>;
}
