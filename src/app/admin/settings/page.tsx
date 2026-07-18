import { AdminSettingsView } from "@/components/admin-settings-view";
import { PermissionGuardedPage } from "@/components/can";
import { P } from "@/lib/iam/permission-keys";

export default function AdminSettingsPage() {
  return (
    <PermissionGuardedPage perm={P.PLATFORM_SETTINGS_MANAGE}>
      <AdminSettingsView />
    </PermissionGuardedPage>
  );
}
