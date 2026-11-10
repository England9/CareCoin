# Care Coin — Get Paid to Care

Mobile-first web app for gamified charity volunteering: discover SDG-aligned events, GPS check-in/out with geofencing, charity verification, Care Coin rewards, leaderboards, and a demo rewards marketplace.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- Prisma + SQLite
- Auth.js (NextAuth v5) credentials auth
- Leaflet maps + Framer Motion

## Quick start

```bash
npm install
npm run db:reset
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Volunteer | `volunteer@carecoin.app` | `password123` |
| Charity | `charity@carecoin.app` | `password123` |
| Admin | `admin@carecoin.app` | `password123` |

## Features

- Role-based auth (Volunteer / Charity / Admin)
- Event discovery with map + filters (city, charity, SDG, date)
- GPS geofenced check-in/out (+ demo override for local testing)
- Charity verification of hours & trash (lbs) → Care Coin awards
- Impact tracking, badges, levels, streaks, leaderboards
- Rewards store with demo cash & physical redemptions
- Lifetime Impact community counters
- Privacy controls + account deletion
- Seeded demo data: 25+ charities, events, ~80 volunteers

Demo rewards do **not** process real payouts or shipments.

## Deploy to Cloudflare

Full Next.js hosting uses **Workers** (OpenNext), not static Pages.

```bash
npm run deploy
```

See **[CLOUDFLARE.md](./CLOUDFLARE.md)** for dashboard build/deploy settings, D1, and secrets.
