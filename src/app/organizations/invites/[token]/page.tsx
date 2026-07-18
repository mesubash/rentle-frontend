"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { organizationsApi } from "@/lib/api/organizations";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/components/auth-provider";
import { useOrg } from "@/components/org-provider";
import { useToast } from "@/components/toast-provider";
import { SiteFooter } from "@/components/site-footer";

export default function AcceptInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const { user, loading } = useAuth();
  const { setActiveOrgId, reload } = useOrg();
  const { showToast } = useToast();
  const [accepting, setAccepting] = useState(false);

  async function accept() {
    setAccepting(true);
    try {
      const org = await organizationsApi.acceptInvite(token);
      reload();
      setActiveOrgId(org.id);
      showToast(`You've joined ${org.name}.`, { tone: "success" });
      router.push(`/organizations/${org.id}`);
    } catch (caught) {
      showToast(caught instanceof ApiError ? caught.message : "This invite could not be accepted.", { tone: "error" });
      setAccepting(false);
    }
  }

  return (
    <>
      <main className="page">
        <div className="container narrow-page">
          <header className="trust-hero" style={{ textAlign: "left", marginBottom: 24 }}>
            <p className="eyebrow"><Building2 size={15} /> Organization invite</p>
            <h1>You&apos;ve been invited</h1>
            <p>Accept to join this organization. You&apos;ll then be able to act on its behalf from the account switcher.</p>
          </header>
          <div className="card card-pad form-grid">
            {loading ? null : !user ? (
              <p className="form-note">Log in with the invited email address to accept. <a href={`/login?next=/organizations/invites/${token}`}>Log in</a></p>
            ) : (
              <button className="button" disabled={accepting} onClick={accept}>{accepting ? "Joining…" : "Accept invite"}</button>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
