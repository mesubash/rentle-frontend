"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "./auth-provider";
import { ReportButton } from "./report-button";
import { TrustBadge } from "./trust-badge";
import { ProfileActivity } from "./profile-activity";
import { AccountActions } from "./account-actions";
import { assetUrl } from "@/lib/api/assets";
import { usersApi, type PublicProfile, type UserProfile } from "@/lib/api/users";

type DisplayProfile = Pick<PublicProfile, "id" | "fullName" | "profilePhotoUrl" | "trustScore" | "memberSince"> & {
  verified: boolean;
  email?: string;
  kycStatus?: UserProfile["kycStatus"];
  phoneVerified?: boolean;
  emailVerified?: boolean;
  status?: UserProfile["status"];
};

export function ProfileView({ own = false, userId, embedded = false }: { own?: boolean; userId?: string; embedded?: boolean }) {
  const Shell = embedded ? "div" : "main";
  const auth = useAuth();
  const [publicProfile, setPublicProfile] = useState<DisplayProfile | null>(null);
  const [loadingPublic, setLoadingPublic] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (own || !userId) return;
    let active = true;
    usersApi.publicProfile(userId)
      .then((value) => active && setPublicProfile(value))
      .catch(() => active && setError("We could not load this profile."))
      .finally(() => active && setLoadingPublic(false));
    return () => { active = false; };
  }, [own, userId]);

  const profile = own ? toDisplayProfile(auth.user) : publicProfile;
  const loading = own ? auth.loading : Boolean(userId && loadingPublic);

  if (loading) return <Shell className="page"><div className="container profile-page" aria-label="Loading profile"><div className="profile-hero skeleton" /><div className="profile-summary-skeleton skeleton" /></div></Shell>;
  if (!profile) return <Shell className="page"><div className="container narrow-page"><section className="empty-state card"><p className="eyebrow">{own ? "Your account" : "Member profile"}</p><h1>{own ? "Log in to view your profile" : "Profile unavailable"}</h1><p>{error || (userId ? "We could not find this member." : "This profile link is incomplete.")}</p><Link className="button" href={own ? "/login" : "/explore"}>{own ? "Log in" : "Browse listings"}</Link></section></div></Shell>;

  const joined = new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(profile.memberSince));
  const photo = assetUrl(profile.profilePhotoUrl);

  return <Shell className="page"><div className="container profile-page">
    <section className="profile-hero card">
      <div className="profile-photo">
        {photo ? <Image src={photo} alt={profile.fullName} fill sizes="120px" /> : <span className="avatar">{initials(profile.fullName)}</span>}
      </div>
      <div className="profile-identity">
        <h1>{profile.fullName}</h1>
        <div className="profile-meta"><TrustBadge verified={profile.verified} /><span>Trust score {formatTrustScore(profile.trustScore)}</span><span><CalendarDays size={15} /> Member since {joined}</span></div>
        {own && profile.email && <p>{profile.email}</p>}
        {!own && <div className="profile-report"><ReportButton targetType="USER" targetId={profile.id} label="Report this member" /></div>}
      </div>
      {own && <AccountActions />}
    </section>

    {own && !profile.verified && <section className="verification-banner card"><ShieldCheck size={24} /><h2>{profile.kycStatus === "SUBMITTED" ? "Your identity is under review." : profile.kycStatus === "REJECTED" ? "Your verification was rejected — resubmit." : "Get verified to book and list."}</h2>{profile.kycStatus !== "SUBMITTED" && <Link className="button" href="/verification">{profile.kycStatus === "REJECTED" ? "Resubmit" : "Start verification"}</Link>}</section>}

    <ProfileActivity userId={profile.id} own={own} />
  </div></Shell>;
}

function toDisplayProfile(profile: UserProfile | null): DisplayProfile | null {
  if (!profile) return null;
  return { ...profile, verified: profile.citizenshipVerified, memberSince: profile.createdAt };
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function formatTrustScore(value: number | null | undefined) {
  return value && value > 0 ? `${value.toFixed(1)} / 5` : "No reviews yet";
}
