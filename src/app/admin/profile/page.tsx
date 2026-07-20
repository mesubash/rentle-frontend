import type { Metadata } from "next";
import { AdminProfileView } from "@/components/admin-profile-view";
import { PermissionGuardedPage } from "@/components/can";
import { ADMIN_ENTRY_KEYS } from "@/lib/iam/admin-entry-keys";

export const metadata: Metadata = { title: "Your profile" };

export default function AdminProfilePage() {
  return <PermissionGuardedPage any={ADMIN_ENTRY_KEYS}><AdminProfileView /></PermissionGuardedPage>;
}
