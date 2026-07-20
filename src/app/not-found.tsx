import Link from "next/link";
export default function NotFound() { return <main className="page"><section className="container empty-state"><p className="eyebrow">404</p><h1>This listing is no longer on the board.</h1><p>It may have been paused or removed. Explore nearby items that are available now.</p><Link className="button" href="/explore">Explore listings</Link></section></main>; }
