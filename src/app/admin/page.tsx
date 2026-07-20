import { AdminDashboard } from "@/components/admin-dashboard";
import { PermissionGuardedPage } from "@/components/can";
import { ADMIN_ENTRY_KEYS } from "@/lib/iam/admin-entry-keys";

export default function AdminDashboardPage() {
  return (
    <PermissionGuardedPage any={ADMIN_ENTRY_KEYS}>
      <AdminDashboard />
    </PermissionGuardedPage>
  );
}
