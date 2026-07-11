"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "./auth-provider";
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

export function ProfileView({ own = false, userId }: { own?: boolean; userId?: string }) {
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

  if (loading) return <main className="page"><div className="container profile-page" aria-label="Loading profile"><div className="profile-hero skeleton" /><div className="profile-summary-skeleton skeleton" /></div></main>;
  if (!profile) return <main className="page"><div className="container narrow-page"><section className="empty-state card"><p className="eyebrow">{own ? "Your account" : "Member profile"}</p><h1>{own ? "Log in to view your profile" : "Profile unavailable"}</h1><p>{error || (userId ? "We could not find this member." : "This profile link is incomplete.")}</p><Link className="button" href={own ? "/login" : "/explore"}>{own ? "Log in" : "Browse listings"}</Link></section></div></main>;

  const joined = new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(profile.memberSince));
  const photo = assetUrl(profile.profilePhotoUrl);

  return <main className="page"><div className="container profile-page">
    <section className="profile-hero card">
      <div className="profile-photo">
        {photo ? <Image src={photo} alt={profile.fullName} fill sizes="120px" /> : <span className="avatar">{initials(profile.fullName)}</span>}
      </div>
      <div className="profile-identity">
        <h1>{profile.fullName}</h1>
        <div className="profile-meta"><TrustBadge verified={profile.verified} />{profile.trustScore != null && <span>Trust score {Math.round(profile.trustScore)}/100</span>}<span><CalendarDays size={15} /> Member since {joined}</span></div>
        {own && profile.email && <p>{profile.email}</p>}
      </div>
      {own && <AccountActions />}
    </section>

    {own && !profile.verified && <section className="verification-banner card"><ShieldCheck size={24} /><h2>{profile.kycStatus === "SUBMITTED" ? "Your identity is under review." : profile.kycStatus === "REJECTED" ? "Your verification was rejected — resubmit." : "Get verified to book and list."}</h2>{profile.kycStatus !== "SUBMITTED" && <Link className="button" href="/verification">{profile.kycStatus === "REJECTED" ? "Resubmit" : "Start verification"}</Link>}</section>}

    <ProfileActivity userId={profile.id} own={own} />
  </div></main>;
}

function toDisplayProfile(profile: UserProfile | null): DisplayProfile | null {
  if (!profile) return null;
  return { ...profile, verified: profile.citizenshipVerified, memberSince: profile.createdAt };
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}
