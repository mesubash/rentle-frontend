import Link from "next/link";
import { ArrowRight, MapPin, ShieldCheck } from "lucide-react";
import { BrandLogo } from "./brand-logo";

const groups = [
  { title: "Marketplace", links: [{ href: "/explore", label: "Explore listings" }, { href: "/list", label: "List an item or service" }, { href: "/bookings", label: "My bookings" }] },
  { title: "Trust & support", links: [{ href: "/trust", label: "How trust works" }, { href: "/verification", label: "Identity verification" }, { href: "/messages", label: "Booking messages" }] },
  { title: "Account", links: [{ href: "/profile", label: "My profile" }, { href: "/login", label: "Log in" }, { href: "/register", label: "Create an account" }] },
];

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="container">
      <section className="footer-cta"><div><p className="eyebrow">Share what you have</p><h2>Put useful things to work.</h2><p>Create a clear listing, set your own price and deposit, and decide who you rent to.</p></div><div className="footer-cta__actions"><Link className="button" href="/list">Create a listing <ArrowRight size={17} /></Link><Link className="button button--secondary" href="/explore">Explore Rentle</Link></div></section>

      <div className="footer-main"><div className="footer-brand"><BrandLogo footer inverted /><p>Borrow useful items and book local services from people nearby.</p><span><ShieldCheck size={17} /> Clear identity and booking signals</span></div><nav className="footer-nav" aria-label="Footer navigation">{groups.map((group) => <section key={group.title}><h3>{group.title}</h3>{group.links.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}</section>)}</nav></div>

      <div className="footer-bottom"><span>© 2026 Rentle Marketplace</span><span><MapPin size={15} /> Built for neighborhood exchange across Nepal</span></div>
    </div>
  </footer>;
}
