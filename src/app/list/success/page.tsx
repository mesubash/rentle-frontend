import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, MapPin } from "lucide-react";
import { ShareListingButton } from "@/components/share-listing-button";
import { images } from "@/lib/data";

export const metadata: Metadata = { title: "Listing published" };

export default async function ListingSuccessPage({ searchParams }: { searchParams: Promise<{ title?: string; district?: string; price?: string; type?: string }> }) {
  const { title = "New Rentle listing", district = "Kathmandu", price = "0", type = "Product" } = await searchParams;
  return <main className="page"><div className="container publish-success"><section className="publish-success__message"><CheckCircle2 size={38} /><p className="eyebrow">Listing published</p><h1>Your listing is live.</h1><p>Renters can now find it in Explore. Booking requests will appear under “My listings’ bookings.”</p></section><article className="listing-preview card"><div className="listing-preview__image"><Image src={images.sony} alt="Published listing cover" fill sizes="600px" priority /><span className={`type-chip type-chip--${type.toLowerCase()}`}>{type}</span></div><div><p><MapPin size={14} /> {district}</p><h2>{title}</h2><p>Your description, availability, deposit, and verification status are now visible to renters.</p><strong>NPR {Number(price).toLocaleString("en-NP")} / {type === "Service" ? "hour" : "day"}</strong></div></article><div className="button-row"><Link className="button" href="/profile">View on my profile</Link><Link className="button button--secondary" href="/explore">Open Explore</Link><ShareListingButton title={title} /></div></div></main>;
}
