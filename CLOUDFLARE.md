# Host Care Coin on Cloudflare (Workers & Pages)

Care Coin is a **full Next.js app** (auth, APIs, Prisma). Cloudflare’s **static Pages** preset cannot run it.

Use **Cloudflare Workers** via OpenNext (same **Workers & Pages** dashboard). Local SQLite is replaced by **Cloudflare D1** in production.

## Already configured in this repo

| File | Purpose |
|------|---------|
| `wrangler.jsonc` | Worker name `care-coin`, D1 binding `DB`, assets, observability |
| `open-next.config.ts` | OpenNext Cloudflare adapter |
| `public/_headers` | Long-cache `/_next/static/*` |
| `.dev.vars.example` | Local secrets template |
| `npm run deploy` | Build + deploy |
| `npm run pages:build` | OpenNext build only |
| `npm run preview` | Local Workers runtime preview |

D1 database: **`care-coin-db`** (`f239a1cb-0758-42b3-bd4c-771e7fc59800`)

---

## Option A — CLI launch (recommended)

```bash
cp .dev.vars.example .dev.vars
# edit AUTH_SECRET

npm install
npm run db:reset          # local SQLite for next dev
npm run deploy            # OpenNext build + wrangler deploy
```

Set production secrets (after first deploy):

```bash
npx wrangler secret put AUTH_SECRET
npx wrangler secret put AUTH_TRUST_HOST   # value: true
npx wrangler secret put SEED_SECRET       # same as AUTH_SECRET is fine
```

Seed D1 once:

```bash
curl -X POST "https://care-coin.<your-subdomain>.workers.dev/api/seed" \
  -H "x-seed-secret: YOUR_AUTH_SECRET"
```

---

## Option B — Cloudflare dashboard (Workers & Pages → Connect Git)

1. Open [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages)
2. **Create application** → **Import a repository** → select `CareCoin`
3. Configure **Workers** (not “Pages / static Next.js”)

### Build settings

| Setting | Value |
|---------|--------|
| Framework preset | None / Workers |
| Build command | `npx opennextjs-cloudflare build` |
| Deploy command | `npx opennextjs-cloudflare deploy` |
| Root directory | `/` (repo root) |
| Node version | `20` or `22` |

### Build variables & secrets

| Name | Value |
|------|--------|
| `AUTH_SECRET` | long random string |
| `AUTH_TRUST_HOST` | `true` |
| `SEED_SECRET` | same as `AUTH_SECRET` (or separate) |
| `NEXTAUTH_URL` | your production URL (e.g. `https://care-coin.YOUR_SUBDOMAIN.workers.dev`) |

Also add the same as **Worker runtime secrets** under Settings → Variables and Secrets.

### Bindings

Ensure the Worker has the D1 binding from `wrangler.jsonc`:

- Binding name: `DB`
- Database: `care-coin-db`

---

## Option C — Classic Cloudflare Pages (static only) — **not supported**

| Setting | Value |
|---------|--------|
| Framework preset | Next.js (Static HTML Export) |
| Build command | `npx next build` |
| Build directory | `out` |

This requires `output: 'export'` and **breaks** auth, APIs, check-in, and dashboards. Do not use for Care Coin.

---

## Useful scripts

```bash
npm run preview      # test OpenNext build in workerd locally
npm run deploy       # production deploy
npm run pages:build  # build without deploy
npm run cf-typegen   # generate CloudflareEnv types
```

## Demo accounts (after seed)

- `volunteer@carecoin.app` / `password123`
- `charity@carecoin.app` / `password123`
- `admin@carecoin.app` / `password123`
