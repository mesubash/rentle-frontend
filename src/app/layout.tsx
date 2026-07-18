import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import { cookies } from "next/headers";
import { SiteHeader } from "@/components/site-header";
import { AuthProvider } from "@/components/auth-provider";
import { ToastProvider } from "@/components/toast-provider";
import { PermissionsProvider } from "@/components/permissions-provider";
import { FavoritesProvider } from "@/components/favorites-provider";
import { OrgProvider } from "@/components/org-provider";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const instrumentSans = Instrument_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: "Rentle — Borrow & lend nearby", template: "%s | Rentle" },
  description: "Rent useful items and book trusted local services from verified people across Kathmandu Valley and Pokhara.",
  applicationName: "Rentle",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: "Rentle",
    title: "Rentle — Borrow & lend nearby",
    description: "Rent useful items and book trusted local services from verified people nearby.",
    images: [{ url: "/logo.png", width: 1983, height: 793, alt: "Rentle" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rentle — Borrow & lend nearby",
    description: "Rent useful items and book trusted local services from verified people nearby.",
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#1e5748" };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const hasSessionCookie = Boolean(
    cookieStore.get("rentle_access_token")?.value ||
    cookieStore.get("rentle_refresh_token")?.value,
  );

  return (
    <html lang="en" className={`${fraunces.variable} ${instrumentSans.variable}`} data-scroll-behavior="smooth">
      <body suppressHydrationWarning><ToastProvider><AuthProvider hasSessionCookie={hasSessionCookie}><PermissionsProvider><OrgProvider><FavoritesProvider><SiteHeader />{children}</FavoritesProvider></OrgProvider></PermissionsProvider></AuthProvider></ToastProvider></body>
    </html>
  );
}
