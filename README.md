# Rentle Marketplace

Rentle is a mobile-first peer-to-peer marketplace for renting physical items and booking trusted local services in Nepal. It is designed around verified identity, explicit deposits, booking-scoped communication, and reviews from completed transactions.

The application currently uses realistic local fixture data and client-side interactions to demonstrate the complete product experience. It is ready to be connected to authentication, persistence, file storage, notifications, and payment-proof APIs.

## Technology

- Next.js 16 App Router and React 19
- TypeScript with strict type checking
- Responsive CSS using the Rentle design tokens
- `next/font` for optimized Fraunces and Instrument Sans
- `next/image` with AVIF/WebP delivery
- Lucide icons
- ESLint 9 with Next.js Core Web Vitals rules

## Run locally

Requirements: Node.js 20.9 or newer and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Core transaction flow

```text
Requested → Approved → Deposit pending → Active → Completed → Review
```

1. A renter requests dates or a service time.
2. The owner approves or declines the request.
3. The renter pays the refundable deposit directly through eSewa or Khalti and uploads proof.
4. The owner confirms the money reached their wallet, activating the booking.
5. Either party marks the completed handover or service as finished.
6. Both sides receive a 30-day review window.

Messages open only after approval and always remain attached to a booking.

## Product routes

- `/`, `/explore`, and `/search` — searchable marketplace with category and district filters
- `/listing/sony-alpha-a7-iv` — product listing and booking request flow
- `/listing/event-photography` — service listing variant
- `/bookings` and `/bookings/RNT-8924` — booking list, status timeline, and deposit proof
- `/messages` and `/messages/RNT-8924` — booking-scoped conversations
- `/notifications` — prioritized booking, message, and verification updates
- `/auth/register`, `/auth/verify`, and `/auth/login` — account and phone OTP flows
- `/profile`, `/profile/sarah-m`, and `/verification` — own/public profiles and citizenship verification
- `/list` — draft-persisted listing wizard
- `/admin/verifications`, `/admin/users`, `/admin/listings`, and `/admin/bookings` — admin workspace
- `/trust` — trust-score and deposit model explanation

## Project structure

```text
src/
├── app/          # App Router pages, layouts, metadata, and global styles
├── components/   # Reusable marketplace and workflow components
└── lib/          # Typed fixture data and shared formatting helpers
```

The application favors Server Components and static generation. Client Components are limited to interactive areas such as filtering, booking actions, messaging, uploads, authentication, and listing creation.

## Quality checks

```bash
npm run lint
npm run build
npm audit --omit=dev
```

The marketplace uses statically rendered and SSG routes where possible, `next/image` for responsive AVIF/WebP delivery, local font optimization through `next/font`, small client-side interaction islands, visible focus states, reduced-motion support, and 44px-or-larger mobile targets.

## Production

```bash
npm run build
npm start
```

Environment files and provider-specific deployment directories are intentionally ignored. Add public configuration examples to `.env.example`; never commit real credentials.
