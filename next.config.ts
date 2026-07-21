import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  devIndicators: false,
  turbopack: {
    root: process.cwd(),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Uploaded listing photos never change at a given path, so the optimizer's derived
    // variants can be held far longer than the 60s default.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Content maxes out at --content: 1360px, so the default 2048/3840 buckets are dead
    // weight. imageSizes covers the fixed thumbs actually used (24/34/64/72/80/120/220).
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920],
    imageSizes: [16, 32, 48, 64, 80, 96, 128, 220, 256, 384],
    // Cloudinary-hosted images (production storage). Local files are proxied same-origin.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  async headers() {
    return [
      {
        // Static files under public/ otherwise inherit max-age=0. These are versioned by
        // deploy, not by filename, so a day with revalidation is the safe ceiling.
        source: "/:file(favicon.ico|logo.svg|logo-header.svg|logo.png|apple-touch-icon.png|site.webmanifest)",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
};

export default nextConfig;
