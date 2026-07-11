import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock3, MapPin, MessageCircle, ShieldCheck, Star } from "lucide-react";
import { BookingPanel } from "@/components/booking-panel";
import { AvailabilityCalendar } from "@/components/availability-calendar";
import { SiteFooter } from "@/components/site-footer";
import { TrustBadge } from "@/components/trust-badge";
import { images, listings } from "@/lib/data";

export function generateStaticParams() { return listings.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const listing = listings.find((item) => item.slug === slug);
  return listing ? { title: listing.title, description: `Rent ${listing.title} from a verified owner in ${listing.district}.` } : {};
}

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = listings.find((item) => item.slug === slug);
  if (!listing) notFound();
  const gallery = listing.slug === "sony-alpha-a7-iv" ? [images.sony, images.sonyTop, images.sonyRear, images.sonyLens, images.sonyHands] : [listing.image, listing.image, listing.image];
  const isService = listing.type === "Service";

  return (
    <>
      <main className="page listing-detail-page">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/explore">Explore</Link><span>/</span><span>{listing.category}</span></nav>
          <div className="gallery">
            {gallery.map((image, index) => <div key={`${image}-${index}`} className={index === 0 ? "gallery__main" : "gallery__thumb"}><Image src={image} alt={index === 0 ? listing.alt : `${listing.title} detail ${index}`} fill sizes={index === 0 ? "(max-width: 800px) 100vw, 60vw" : "25vw"} priority={index === 0} loading={index > 0 && index < 3 ? "eager" : undefined} /></div>)}
          </div>

          <div className="listing-detail-layout">
            <article className="listing-content">
              <div className="listing-title-row">
                <div><div className="listing-title-row__meta"><span className={`type-chip type-chip--${listing.type.toLowerCase()}`}>{listing.type}</span><span><MapPin size={15} /> {listing.area}, {listing.district}</span></div><h1>{listing.title}</h1><p className="listing-subline"><span className="rating"><Star size={16} fill="currentColor" /> {listing.rating} ({listing.reviewCount} reviews)</span><TrustBadge /></p></div>
              </div>

              <section className="detail-section"><h2>About this {isService ? "service" : "item"}</h2><p>{isService ? "Document your wedding, bratabandha, or family event with a calm, experienced local photographer. The package includes planning, eight hours of coverage, and a carefully edited online gallery delivered within ten days." : "A dependable full-frame mirrorless camera for weddings, documentary work, and video projects. It is kept in excellent condition and includes two batteries, a charger, strap, and padded carry case."}</p></section>

              <section className="spec-grid card">
                {isService ? <><div><Clock3 /><small>Minimum notice</small><strong>3 days</strong></div><div><MapPin /><small>Service area</small><strong>Kathmandu Valley</strong></div><div><CalendarDays /><small>Typical coverage</small><strong>8 hours</strong></div><div><CheckCircle2 /><small>Delivery</small><strong>Within 10 days</strong></div></> : <><div><small>Condition</small><strong>Like new</strong></div><div><small>Brand</small><strong>Sony</strong></div><div><small>Model</small><strong>Alpha A7 IV</strong></div><div><small>Included</small><strong>28–70mm lens</strong></div></>}
              </section>

              <section className="detail-section"><h2>Availability</h2><AvailabilityCalendar /></section>

              <section className="owner-card card"><div className="owner-card__head"><span className="avatar avatar--large">{listing.owner.split(" ").map((part) => part[0]).join("")}</span><div><p className="eyebrow">Hosted by</p><h2>{listing.owner}</h2><TrustBadge /></div></div><dl><div><dt>Trust score</dt><dd>96 / 100</dd></div><div><dt>Reviews</dt><dd>{listing.reviewCount}</dd></div><div><dt>Member since</dt><dd>March 2023</dd></div><div><dt>Usually responds</dt><dd>Within 2 hours</dd></div></dl><Link className="button button--secondary button--small" href="/profile/sarah-m"><MessageCircle size={16} /> View profile</Link></section>

              <section className="detail-section reviews"><div className="section-heading"><h2>Reviews from verified bookings</h2><span className="rating"><Star size={16} fill="currentColor" /> {listing.rating}</span></div>{["Anisha K.", "Rojen T."].map((name, index) => <article key={name} className="review"><div><span className="avatar">{name[0]}</span><div><strong>{name}</strong><p className="rating">★★★★★</p></div><time>July {12 - index}, 2026</time></div><p>{index ? "Clear communication and the handover was exactly as agreed. I would book again." : "The item was in excellent condition. Pickup was easy and every detail matched the listing."}</p></article>)}</section>
            </article>

            <div className="booking-column"><BookingPanel listing={listing} /><div className="deposit-reassurance"><ShieldCheck size={18} /><p><strong>Your deposit stays between you and the owner.</strong><br />The amount and proof remain attached to the booking record.</p></div></div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
