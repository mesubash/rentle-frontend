"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "./auth-provider";
import { useToast } from "./toast-provider";

export function AccountActions() {
  const router = useRouter(); const { logout } = useAuth(); const { showToast } = useToast(); const [leaving, setLeaving] = useState(false);
  async function signOut() { setLeaving(true); try { await logout(); showToast("Logged out!", { tone: "success" }); } catch { showToast("You were logged out on this device, but the server could not be reached.", { tone: "info" }); } finally { router.push("/"); router.refresh(); } }
  return <div className="profile-actions"><Link className="button button--small" href="/profile/edit">Edit profile</Link><button type="button" className="button button--small button--secondary" disabled={leaving} onClick={signOut}>{leaving ? "Logging out…" : "Log out"}</button></div>;
}
