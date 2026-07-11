import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div><Link className="brand brand--footer" href="/">Rentle</Link><p>A safer neighborhood marketplace for Nepal.</p></div>
        <nav aria-label="Footer"><Link href="/trust">Safety & trust</Link><Link href="/profile/sarah-m">Community</Link><Link href="/admin/verifications">Admin</Link></nav>
      </div>
    </footer>
  );
}
