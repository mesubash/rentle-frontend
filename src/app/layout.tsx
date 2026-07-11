import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const instrumentSans = Instrument_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Rentle — Borrow & lend nearby", template: "%s | Rentle" },
  description: "Rent useful items and book trusted local services from verified people across Kathmandu Valley and Pokhara.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#1e5748" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${instrumentSans.variable}`}>
      <body><SiteHeader />{children}</body>
    </html>
  );
}
