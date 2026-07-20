"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit3, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "./auth-provider";
import { useToast } from "./toast-provider";

export function AccountActions() {
  const router = useRouter(); const { logout } = useAuth(); const { showToast } = useToast(); const [leaving, setLeaving] = useState(false);
  async function signOut() { setLeaving(true); try { await logout(); showToast("Logged out!", { tone: "success" }); } catch { showToast("You were logged out on this device, but the server could not be reached.", { tone: "info" }); } finally { router.push("/"); router.refresh(); } }
  return <div className="button-row"><Link className="button button--secondary button--small" href="/profile/edit"><Edit3 size={16} /> Edit profile</Link><button className="button button--secondary button--small" disabled={leaving} onClick={signOut}><LogOut size={16} /> {leaving ? "Logging out…" : "Log out"}</button></div>;
}
