import Link from "next/link";
import { BrandLogo } from "./brand-logo";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div><BrandLogo footer /><p>A safer neighborhood marketplace for Nepal.</p></div>
        <nav aria-label="Footer"><Link href="/trust">Safety & trust</Link><Link href="/explore">Community marketplace</Link><Link href="/admin/verifications">Admin</Link></nav>
      </div>
    </footer>
  );
}
