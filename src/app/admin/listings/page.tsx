import { AdminRecordsView } from "@/components/admin-records-view";
import { PermissionGuardedPage } from "@/components/can";
import { P } from "@/lib/iam/permission-keys";

export default function AdminListingsPage() {
  return <PermissionGuardedPage perm={P.LISTING_LISTING_READ}><AdminRecordsView kind="listings" /></PermissionGuardedPage>;
}
