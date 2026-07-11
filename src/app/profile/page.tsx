import type { Metadata } from "next";
import { ProfileView } from "@/components/profile-view";
export const metadata: Metadata = { title: "My profile" };
export default function MyProfilePage() { return <ProfileView own />; }
