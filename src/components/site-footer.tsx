import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { BrandLogo } from "./brand-logo";

const groups = [
  { title: "Discover", links: [{ href: "/explore", label: "Explore listings" }, { href: "/list", label: "List something" }] },
  { title: "Rentle", links: [{ href: "/about", label: "About" }, { href: "/trust", label: "Trust & safety" }, { href: "/support", label: "Support" }] },
  { title: "Legal", links: [{ href: "/terms", label: "Terms" }, { href: "/privacy", label: "Privacy" }] },
];

export function SiteFooter() {
  return <footer className="site-footer"><div className="container">
    <div className="footer-prompt"><div><strong>Something useful sitting idle?</strong><span>List it for people nearby.</span></div><Link href="/list">Create a listing <ArrowRight size={16} /></Link></div>
    <div className="footer-main"><div className="footer-brand"><BrandLogo footer inverted /><p>A neighborhood marketplace for borrowing useful things and booking local help.</p><span><ShieldCheck size={16} /> Identity and activity shown clearly</span><div className="footer-operator"><strong>Rentle Pvt. Ltd. (registration pending)</strong><small><Link href="/support">Contact support</Link></small></div></div><nav className="footer-nav" aria-label="Footer navigation">{groups.map((group) => <section key={group.title}><h3>{group.title}</h3>{group.links.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}</section>)}</nav></div>
    <div className="footer-bottom"><span>© 2026 Rentle</span><span>Made for exchanges across Nepal</span></div>
  </div></footer>;
}
