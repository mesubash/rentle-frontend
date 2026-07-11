"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/components/toast-provider";

export function useSignOut() {
  const router = useRouter();
  const { logout } = useAuth();
  const { showToast } = useToast();
  const [leaving, setLeaving] = useState(false);

  async function signOut() {
    setLeaving(true);
    try {
      await logout();
      showToast("Logged out!", { tone: "success" });
    } catch {
      showToast("You were logged out on this device, but the server could not be reached.", { tone: "info" });
    } finally {
      setLeaving(false);
      router.push("/");
      router.refresh();
    }
  }

  return { signOut, leaving };
}
