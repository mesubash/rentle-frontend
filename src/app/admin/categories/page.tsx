import { AdminCategoriesView } from "@/components/admin-categories-view";
import { PermissionGuardedPage } from "@/components/can";
import { P } from "@/lib/iam/permission-keys";

export default function AdminCategoriesPage() {
  return (
    <PermissionGuardedPage perm={P.LISTING_CATEGORY_MANAGE}>
      <AdminCategoriesView />
    </PermissionGuardedPage>
  );
}
