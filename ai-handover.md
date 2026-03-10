# Fortress Intelligence: Senior AI Handover & Infrastructure Blueprint

## 🎯 Product Vision (PO Perspective)
Fortress Intelligence is a mission-critical financial analysis engine for Indian equity markets. The infrastructure goal is **Zero-Interference Hosting**. The current setup allows the business to scale to dozens of independent "Fortresses" (client instances or new projects) on a single VPS with institutional-grade isolation.

## 🏗️ Architecture & Isolation Strategy
We utilize a **Vertical Sandbox** approach:
- **Process Isolation (PM2)**: Each app is a distinct OS process.
- **Dependency Isolation (Standalone Build)**: Next.js `standalone` output locks dependencies per project, preventing "shared library" hell.
- **Port Mapping**: Structured port-range strategy (3000, 3001, etc.) handled by Nginx.
- **Data Level**: Every project uses a unique PostgreSQL user and database (see `scripts/create-db-user.sql`).

## 🚀 v5 Extension (Mar 2026)
Specialized deep-value scans ported from manual JSX files into the Next.js data layer:
- **Data Layer**: `Stock` type in `lib/types.ts` extended. A new `V5Stock` interface (extends `Stock`) is the strict type for all v5 card rendering — avoids polluting the core `Stock` type with optional fields.
- **Institutional Scans**: `/v5-extension` route provides tabbed access to "52W Lows", "Qualified Penny", and "Sub-₹10 Speculative" lists.
- **Admin layer**: `/admin/theses` portal enables CRUD operations on investment arguments, protected by NextAuth.js.

## 🔑 Authentication (NextAuth.js v5 / Auth.js v5)
Migrated from Basic Auth to **NextAuth.js (Auth.js v5)**:
- **Provider**: `CredentialsProvider` using `ADMIN_SECRET` env var as the password for account `admin`.
- **CRITICAL**: If `ADMIN_SECRET` is not set, login is **blocked entirely** (returns null, logs CRITICAL error). There is NO hardcoded fallback. Always set this in `.env.local` and on the production VPS.
- **Proxy**: Routes under `/admin` are protected by `proxy.ts` at the project root.

```ts
// proxy.ts (project root) — DO NOT rename to middleware.ts
export { auth as proxy } from "@/auth"
export const config = { matcher: ["/admin/:path*"] }
```

### ⚠️ Next.js 16 Critical Convention
**Use `proxy.ts`, NOT `middleware.ts`.** Next.js 16+ deprecated the `middleware` file convention in favour of `proxy`. If renamed to `middleware.ts`, the build will emit a deprecation warning. The export name must be `proxy` (not `middleware`). This was confirmed via build output: `ƒ Proxy (Middleware)`.

## 🗄️ Database Schema (Drizzle ORM + PostgreSQL)
Schema is in `lib/db/schema.ts`. The `stocks` table was extended with v5 columns in Mar 2026:

**New v5 columns on `stocks`**: `v5_category` (text: `'low'` | `'penny'` | `'sub_ten'` | null), `tag`, `risk`, `industry`, `drop_52w`, `moat`, `l1`–`l5` (integer scores 1–5), `why_down`, `why_buy`, `penny_why`, `multi_bagger_case`, `killer_risk`, `fortress_note`, `ocf`.

**To apply schema to production DB:**
```bash
npm run drizzle:push
```

## 🌱 Data Seeding
Two seed endpoints on `/api/seed`:

| URL | Action |
|-----|--------|
| `GET /api/seed` | Seeds core stocks + concepts from `mock-data.ts` |
| `GET /api/seed?target=v5` | Seeds all v5 stocks (low, penny, sub_ten) into PostgreSQL |

**v5 getter logic** (in `app/actions.ts`): Queries DB for `v5_category` rows first. Falls back to `lib/mock-data.ts` gracefully if the DB has not been seeded yet. After running `?target=v5`, data comes from PostgreSQL automatically.

## 🎨 Visual Identity & UI
- **Fonts**: DM Sans (Sans) + IBM Plex Mono (Mono) via `next/font/google`.
- **Tailwind**: Font variables mapped in `globals.css`.
- **Toast Notifications**: `sonner` v2 installed. `<Toaster>` is mounted in `app/layout.tsx`. Use `toast.success()` / `toast.error()` from `"sonner"` anywhere in the app.
- **No external component library**: `Tabs`, `Input`, `Textarea`, `Button`, `Card` are custom primitives in `components/ui/`.

## 📐 Type System
```
Stock           — core DB-mapped type (lib/types.ts)
V5Stock         — extends Stock, all v5 fields required (lib/types.ts)
StockWithThesis — Stock + Thesis join result
ThesisRow       — admin UI join type (symbol, name, oneLiner, etc.)
```
`V5StockCard` expects `V5Stock`. Do not pass a plain `Stock` — TypeScript will reject it.

## CI/CD Pipeline
- **GitHub Actions**: `.github/workflows/ci.yml`
- **Workflow**: Build & lint on every push → Deploy via SSH on `main` push.
- **Output**: Next.js `standalone` for minimal footprint.
- **Pre-push discipline**: Always run `npm run lint && npm run build` locally before pushing. The Mar 2026 feature required 7 CI-fix commits due to skipping this — do not repeat.

## Key Technical Decisions
1. **`proxy.ts` not `middleware.ts`**: Next.js 16 renamed the convention. `proxy.ts` is correct and clean.
2. **`ADMIN_SECRET` is mandatory**: No hardcoded fallback. Login is blocked if env var is missing — this is by design.
3. **v5 data has a DB fallback**: v5 getters try PostgreSQL first, fall back to mock if `v5_category` rows don't exist.
4. **`getRandomWisdom` uses `ORDER BY RANDOM() LIMIT 1`**: O(1) DB query, not O(n) fetch-then-pick.
5. **`V5Stock` interface**: Keeps core `Stock` clean. v5-specific fields are required on the `V5Stock` subtype.
6. **`seedV5Stocks()` is upsert-safe**: Updates existing stocks with v5 fields if already in DB; inserts new ones otherwise.

## ✅ Completion Status (Mar 2026 — Post Claude Code Session)
- [x] v5 Data Migration: All manual entries from `fortress-v5.jsx` in `lib/mock-data.ts`
- [x] Institutional UI: Shield/Warrior aesthetic in `/v5-extension`
- [x] Admin Thesis Management: Full CRUD at `/admin/theses`
- [x] NextAuth.js v5: `proxy.ts` protection, `ADMIN_SECRET` mandatory (no fallback)
- [x] `V5Stock` type: Clean interface separation from core `Stock`
- [x] `V5StockCard`: Fixed label — "CMP" now correctly describes current price (was "Why it fell")
- [x] Toast system: `sonner` v2 installed, `<Toaster>` in layout, `ThesisEditor` uses `toast.success/error`
- [x] `getRandomWisdom` efficiency: Now `ORDER BY RANDOM() LIMIT 1` — O(1)
- [x] v5 schema columns: Added to `stocks` table in `schema.ts`
- [x] `seedV5Stocks()` server action + `/api/seed?target=v5` endpoint
- [x] "Curated Scan" badge: Replaced misleading "Live Engine" pulsing indicator
- [x] Build: Clean — no errors, no warnings, no deprecations

## ⏳ Pending / Next Steps
1. **Push schema to production PostgreSQL** (required before v5 seed):
   ```bash
   npm run drizzle:push
   ```
2. **Seed v5 stocks to production DB**:
   ```bash
   curl https://your-domain.com/api/seed?target=v5
   ```
3. **Mobile Polish**: Dense data cards in v5 extension need responsive review on small viewports.
4. **Real-time Data**: Replace static curated scan data with a live market feed (NSE/BSE data provider).
5. **Admin: v5 Stock Editor**: Currently `/admin` only manages theses. A UI to create/edit v5 stock entries would complete the admin layer.

## Maintenance Commands
```bash
# Full update cycle on VPS
git pull origin main && npm ci && npm run build && pm2 reload fortress-app

# Apply schema diff to PostgreSQL
npm run drizzle:push

# Seed v5 stocks (run after drizzle:push)
curl http://localhost:3000/api/seed?target=v5

# Monitor
pm2 status
pm2 logs fortress-app
```
