import type { Metadata } from "next";
import { ProfileView } from "@/components/profile-view";

export const metadata: Metadata = { title: "Your profile" };

export default function AdminProfilePage() {
  return <ProfileView own embedded />;
}
