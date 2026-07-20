import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { BrandLogo } from "./brand-logo";

const groups = [
  { title: "Discover", links: [{ href: "/explore", label: "Explore listings" }, { href: "/list", label: "List something" }] },
  { title: "Rentle", links: [{ href: "/about", label: "About" }, { href: "/trust", label: "Trust & safety" }, { href: "/support", label: "Support" }] },
  { title: "Legal", links: [{ href: "/terms", label: "Terms" }, { href: "/privacy", label: "Privacy" }] },
];

type FooterPrompt = {
  title: string;
  description: string;
  href: string;
  label: string;
};

const defaultPrompt: FooterPrompt = {
  title: "Something useful sitting idle?",
  description: "List it for people nearby.",
  href: "/list",
  label: "Create a listing",
};

export function SiteFooter({ prompt = defaultPrompt }: { prompt?: FooterPrompt }) {
  return <footer className="site-footer"><div className="container">
    <div className="footer-prompt"><div><strong>{prompt.title}</strong><span>{prompt.description}</span></div><Link href={prompt.href}>{prompt.label} <ArrowRight size={16} /></Link></div>
    <div className="footer-main"><div className="footer-brand"><BrandLogo footer inverted /><p>A neighborhood marketplace for borrowing useful things and booking local help.</p><span><ShieldCheck size={16} /> Identity and activity shown clearly</span><div className="footer-operator"><strong>Rentle Pvt. Ltd. (registration pending)</strong><small><Link href="/support">Contact support</Link></small></div></div><nav className="footer-nav" aria-label="Footer navigation">{groups.map((group) => <section key={group.title}><h3>{group.title}</h3>{group.links.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}</section>)}</nav></div>
    <div className="footer-bottom"><span>© 2026 Rentle</span><span>Made for exchanges across Nepal</span></div>
  </div></footer>;
}
