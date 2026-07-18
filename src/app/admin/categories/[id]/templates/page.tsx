import { AdminCategoryPricingView } from "@/components/admin-category-pricing-view";
import { AdminCategoryTemplatesView } from "@/components/admin-category-templates-view";
import { PermissionGuardedPage } from "@/components/can";
import { P } from "@/lib/iam/permission-keys";

export default async function AdminCategoryTemplatesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PermissionGuardedPage perm={P.LISTING_CATEGORY_MANAGE}>
      <div className="admin-scope space-y-8">
        <AdminCategoryTemplatesView categoryId={id} />
        <AdminCategoryPricingView categoryId={id} />
      </div>
    </PermissionGuardedPage>
  );
}
