import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import styles from "./page-back-link.module.css";

export function PageBackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link className={styles.link} href={href}><ChevronLeft size={17} />{children}</Link>;
}
