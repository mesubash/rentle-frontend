import Image from "next/image";
import Link from "next/link";

export function BrandLogo({ href = "/", priority = false, footer = false, inverted = false }: { href?: string; priority?: boolean; footer?: boolean; inverted?: boolean }) {
  return <Link className={footer ? "brand brand--footer" : "brand"} href={href} aria-label="Rentle home"><Image src={inverted ? "/logo-header.svg" : "/logo.svg"} alt="Rentle" width={1983} height={793} priority={priority} /></Link>;
}
