"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Edit3, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "./auth-provider";
import { TrustBadge } from "./trust-badge";
import { ProfileActivity } from "./profile-activity";
import { assetUrl } from "@/lib/api/assets";
import { usersApi, type PublicProfile, type UserProfile } from "@/lib/api/users";

type DisplayProfile = Pick<PublicProfile, "id" | "fullName" | "profilePhotoUrl" | "trustScore" | "memberSince"> & {
  verified: boolean;
  email?: string;
  citizenshipUploaded?: boolean;
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

  if (loading) return <main className="page"><div className="container narrow-page"><p>Loading profile…</p></div></main>;
  if (!profile) return <main className="page"><div className="container narrow-page"><section className="card card-pad"><h1>{own ? "Log in to view your profile" : "Profile unavailable"}</h1><p>{error || (userId ? "We could not find this member." : "This profile link is incomplete.")}</p><Link className="button" href={own ? "/auth/login" : "/explore"}>{own ? "Log in" : "Browse listings"}</Link></section></div></main>;

  const joined = new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(profile.memberSince));
  const photo = assetUrl(profile.profilePhotoUrl);

  return <main className="page"><div className="container profile-page">
    <section className="profile-hero card">
      <div className="profile-photo">
        {photo ? <Image src={photo} alt={profile.fullName} fill sizes="120px" /> : <span className="avatar">{initials(profile.fullName)}</span>}
      </div>
      <div className="profile-identity">
        <p className="eyebrow">{own ? "Your profile" : "Rentle neighbor"}</p>
        <h1>{profile.fullName}</h1>
        <div className="profile-meta"><TrustBadge verified={profile.verified} /><span><CalendarDays size={15} /> Member since {joined}</span></div>
        {own && profile.email && <p>{profile.email}</p>}
      </div>
      {own && <Link className="button button--secondary button--small" href="/profile/edit"><Edit3 size={16} /> Edit profile</Link>}
    </section>

    <section className="trust-score card"><div><p className="eyebrow">Trust score</p><strong>{Math.round(profile.trustScore)}<small>/100</small></strong></div><div className="trust-score__bar"><span style={{ width: `${Math.min(100, Math.max(0, profile.trustScore))}%` }} /></div><p>Built from verification and completed activity on Rentle.</p></section>

    {own && !profile.verified && <section className="verification-banner card"><ShieldCheck size={28} /><div><p className="eyebrow">Identity check</p><h2>{profile.citizenshipUploaded ? "Your citizenship is under review." : "Verify your citizenship."}</h2><p>{profile.citizenshipUploaded ? "You can keep using Rentle while the team reviews it." : "A verified identity gives owners a clearer trust signal."}</p></div>{!profile.citizenshipUploaded && <Link className="button" href="/verification">Start verification</Link>}</section>}

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
