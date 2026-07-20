# Rentle Marketplace

Rentle is a mobile-first marketplace for renting physical items and booking local services in Nepal. The frontend is connected to the Rentle Spring Boot backend for accounts, identity verification, listings, availability, bookings, deposit proof, messages, reviews, and administration.

## Stack

- Next.js 16 App Router, React 19, and strict TypeScript
- Responsive CSS with local design tokens
- Scoped Tailwind CSS v4 and shadcn/ui components inside the admin console only
- Optimized Google fonts through `next/font`
- Responsive AVIF/WebP images through `next/image`
- A same-origin backend-for-frontend proxy with HTTP-only auth cookies

## Local setup

Requirements: Node.js 20.9 or newer, npm, and the sibling `rentle-backend` project.

```bash
cp .env.example .env.local
npm install
npm run dev
```

By default, the frontend expects:

```dotenv
RENTLE_API_URL=http://localhost:8080/api/v1
RENTLE_BACKEND_URL=http://localhost:8080
```

Start the backend according to `../rentle-backend/README.md`, then open [http://localhost:3000](http://localhost:3000). Never expose backend tokens or secrets through `NEXT_PUBLIC_*` variables.

## Product flow

```text
Requested → Approved → Deposit pending → Active → Completed → Review
```

The renter requests dates, the owner makes a decision, and an approved booking opens messages. If a deposit is required, the renter pays the owner directly and uploads proof. The owner checks their own account before confirming. A completed booking allows each participant to leave a verified review.

## Routes

- `/`, `/explore`, `/search` — listing search with category, type, district, and price filters
- `/listing/{uuid}` — details, availability-aware booking, reviews, rental terms, report
- `/list`, `/listings/manage`, `/listings/manage/{uuid}` — verification-gated listing wizard + owner tools
- `/bookings`, `/bookings/{uuid}` — lifecycle, deposit proof, condition evidence, worker assignment, reviews
- `/messages`, `/messages/{bookingUuid}` — booking-scoped conversations with unread state
- `/favorites` — saved listings
- `/workers` — business worker registry
- `/profile`, `/profile/{userUuid}`, `/profile/edit` — account, public activity, business/wallet settings
- `/verification` — email/phone/citizenship verification
- `/notifications` — real notification feed
- `/login`, `/register`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/google/callback`
- `/terms`, `/privacy`, `/support` — legal + grievance channel
- Admin (`/admin/*`, permission-gated) — dashboard, verifications, users, listings, bookings, categories
  (+ field-template & pricing editors), reports, fees, settings, roles, staff assignments

## API architecture

Browser requests use `/api/rentle/*`. Route handlers forward them to the backend, store access and refresh tokens in HTTP-only cookies, and rotate an expired session without exposing tokens to browser JavaScript. Backend-hosted files are served through `/api/rentle-files/*`.

Typed endpoint clients live in `src/lib/api/`, grouped by domain.

## Staff access bootstrap

The first super-admin assignment is bootstrapped by the backend. Set
`RENTLE_IAM_SUPER_ADMIN_EMAIL` to an existing account email before starting the
backend. The backend retries on the next boot if that account does not exist yet.
After bootstrap, manage role bundles and assignments from `/admin/roles` and
`/admin/staff`.

## Quality checks

```bash
npm run lint
npm run build
npm audit --omit=dev
```

Environment files, build output, editor files, provider directories, and `AGENTS.md` are intentionally ignored.
