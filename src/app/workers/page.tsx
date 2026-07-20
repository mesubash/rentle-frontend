"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOrg } from "@/components/org-provider";

// Workers now belong to organizations. This legacy route redirects into the org dashboard
// (its Workers section) or to org creation if the user has no organization yet.
export default function WorkersRedirect() {
  const router = useRouter();
  const { orgs, activeOrgId, ready } = useOrg();

  useEffect(() => {
    if (!ready) return;
    const target = activeOrgId ?? orgs[0]?.id;
    router.replace(target ? `/organizations/${target}` : "/organizations/new");
  }, [ready, orgs, activeOrgId, router]);

  return (
    <main className="page">
      <div className="container narrow-page"><p className="form-note">Taking you to your organization…</p></div>
    </main>
  );
}
