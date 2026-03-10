# Fortress Intelligence: Senior AI Handover & Infrastructure Blueprint

## 🎯 Product Vision (PO Perspective)
Fortress Intelligence is a mission-critical financial analysis engine for Indian equity markets. The infrastructure goal is **Zero-Interference Hosting**. The current setup allows the business to scale to dozens of independent "Fortresses" (client instances or new projects) on a single VPS with institutional-grade isolation.

## 🏗️ Architecture & Isolation Strategy
**Vertical Sandbox** approach:
- **Process Isolation (PM2)**: Each app is a distinct OS process named `fortress`, managed by `/opt/fortress/ecosystem.config.js`.
- **Dependency Isolation**: Next.js `standalone` output configured in `next.config.ts`.
- **Port**: App runs on **port 3000** on the VPS (`srv1327289`, Hostinger).
- **Data Level**: PostgreSQL with dedicated user `fortress_user` and database `fortress`.

## 🖥️ VPS Production State (as of Mar 2026)
- **Server**: `srv1327289` (Hostinger VPS)
- **App path**: `/opt/fortress/`
- **Git remote**: `https://github.com/BratAIExplorer/Fortress.git` (branch: `main`)
- **PM2 process**: `fortress` (id 0), running `npm start` from `/opt/fortress`
- **Database**: PostgreSQL — `fortress_user` @ `localhost:5432/fortress`
- **Env file**: `/opt/fortress/.env.local` (not in git — must be maintained manually on VPS)
- **Node**: v20.20.0 | **npm**: 10.8.2 | **PM2**: 6.0.14

### Required `/opt/fortress/.env.local`
```env
DATABASE_URL=postgresql://fortress_user:YOUR_PASSWORD@localhost:5432/fortress
ADMIN_SECRET=your-admin-panel-password
AUTH_SECRET=your-32-char-random-string
```
⚠️ This file is **not in git**. If the VPS is rebuilt, recreate it manually before starting the app.

## 🚀 v5 Extension (Mar 2026)
Specialized deep-value scans ported from manual JSX files into the Next.js + PostgreSQL data layer:
- **Data Layer**: `V5Stock` interface (extends `Stock`) in `lib/types.ts` — strict typing for v5 cards.
- **Institutional Scans**: `/v5-extension` — tabbed access to "52W Lows" (19 stocks), "Qualified Penny" (4 stocks), "Sub-₹10 Speculative" (1 stock). **24 total seeded to DB.**
- **Admin layer**: `/admin/theses` — CRUD on investment theses, protected by NextAuth.js.
- **DB seeded**: ✅ `GET /api/seed` and `GET /api/seed?target=v5` both confirmed successful.

## 🔑 Authentication (NextAuth.js v5 / Auth.js v5)
- **Provider**: `CredentialsProvider` — username `admin`, password = `ADMIN_SECRET` env var.
- **CRITICAL**: No hardcoded fallback. Login blocked entirely if `ADMIN_SECRET` is unset.
- **Proxy file**: `proxy.ts` at project root (NOT `middleware.ts` — Next.js 16 renamed the convention).

```ts
// proxy.ts — DO NOT rename to middleware.ts
export { auth as proxy } from "@/auth"
export const config = { matcher: ["/admin/:path*"] }
```

### ⚠️ Next.js 16 Convention
`proxy.ts` is the correct filename. `middleware.ts` is **deprecated** in Next.js 16 and triggers a build warning. Confirmed via: `ƒ Proxy (Middleware)` in build output.

## 🗄️ Database (Drizzle ORM + PostgreSQL)
Schema: `lib/db/schema.ts` — pushed to production via `drizzle-kit push`.

**v5 columns on `stocks` table** (added Mar 2026, already applied to prod):
`v5_category`, `tag`, `risk`, `industry`, `drop_52w`, `moat`, `l1`–`l5`, `why_down`, `why_buy`, `penny_why`, `multi_bagger_case`, `killer_risk`, `fortress_note`, `ocf`

**Apply schema changes to prod DB:**
```bash
# Must prefix DATABASE_URL — drizzle-kit doesn't auto-load .env.local
DATABASE_URL=postgresql://fortress_user:PASSWORD@localhost:5432/fortress npm run drizzle:push
```

## 🌱 Seed Endpoints
| URL | Action | Status |
|-----|--------|--------|
| `GET /api/seed` | Core stocks + concepts | ✅ Done |
| `GET /api/seed?target=v5` | 24 v5 stocks to PostgreSQL | ✅ Done (inserted: 24) |

**v5 getter logic**: Queries `v5_category` column in DB first. Falls back to `lib/mock-data.ts` if no rows found (safe for fresh deployments before seeding).

## 🚢 CI/CD Pipeline
- **Repo**: `github.com/BratAIExplorer/Fortress`
- **Workflow**: `.github/workflows/ci.yml`
- **Trigger**: Every push to `main`
- **Steps**: Build + lint → Deploy via native SSH to VPS

### GitHub Secrets Required
| Secret | Value |
|--------|-------|
| `VPS_HOST` | VPS IP address |
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | Full ed25519 private key from `/root/.ssh/fortress_deploy` |

### SSH Key Location (VPS)
```bash
cat /root/.ssh/fortress_deploy        # private key → VPS_SSH_KEY secret
cat /root/.ssh/fortress_deploy.pub    # verify this is in authorized_keys
```

### ⚠️ CI SSH Notes
- Uses **native ubuntu SSH client** (NOT `appleboy/ssh-action` — its PEM parser is broken for ed25519).
- Key is written via env var (`echo "$SSH_KEY"`) not inline secret — preserves newlines correctly.
- `ssh-keyscan` handles host key verification automatically.

### Deploy Script (on VPS)
```bash
cd /opt/fortress
git pull origin main
npm ci
npm run build
pm2 restart fortress --update-env || pm2 start npm --name "fortress" -- start
pm2 save
```

## 🎨 Visual Identity & UI
- **Fonts**: DM Sans (Sans) + IBM Plex Mono (Mono) via `next/font/google`.
- **Toast**: `sonner` v2 — `<Toaster>` in `app/layout.tsx`. Use `toast.success/error()` from `"sonner"`.
- **No external UI library**: All primitives (`Tabs`, `Input`, `Textarea`, `Button`, `Card`) are custom in `components/ui/`.

## 📐 Type System
```
Stock           — core DB-mapped type (lib/types.ts)
V5Stock         — extends Stock, v5 fields required (lib/types.ts)
StockWithThesis — Stock + Thesis join result
ThesisRow       — admin UI join type (actions.ts)
```
`V5StockCard` requires `V5Stock`. TypeScript will reject plain `Stock`.

## Key Technical Decisions
1. **`proxy.ts` not `middleware.ts`**: Next.js 16 convention. Never rename.
2. **`ADMIN_SECRET` mandatory**: No fallback. Blocks login if unset — intentional.
3. **v5 DB fallback**: `getV5*()` try DB first, fall back to mock-data. Safe pre-seed.
4. **`getRandomWisdom` = `ORDER BY RANDOM() LIMIT 1`**: O(1), was O(n).
5. **`V5Stock` interface**: Core `Stock` stays clean. v5 fields required on subtype.
6. **`seedV5Stocks()` is upsert-safe**: Updates existing symbols, inserts new ones.
7. **drizzle:push needs explicit DATABASE_URL**: Does not auto-load `.env.local`.
8. **Native SSH in CI**: `appleboy/ssh-action` PEM parser broken for ed25519 keys.

## ✅ Full Completion Status (Mar 10 2026)
### Code
- [x] v5 types: `V5Stock` interface, `Stock` kept clean
- [x] v5 UI: `/v5-extension` with 3-tab deep value scans
- [x] v5 data: `seedV5Stocks()` + `/api/seed?target=v5`
- [x] v5 schema: 18 new columns on `stocks` table
- [x] Admin: Full thesis CRUD at `/admin/theses`
- [x] Auth: NextAuth.js v5, `proxy.ts`, no hardcoded secrets
- [x] Toast: `sonner` v2, `ThesisEditor` uses `toast.success/error`
- [x] Query efficiency: `getRandomWisdom` O(1)
- [x] Label fix: `V5StockCard` "CMP" not "Why it fell"
- [x] Badge fix: "Curated Scan" not "Live Engine"
- [x] CI: Native SSH client replaces `appleboy/ssh-action`

### Infrastructure
- [x] VPS git repo initialized at `/opt/fortress`
- [x] PostgreSQL `fortress_user` + `fortress` database confirmed
- [x] `drizzle:push` applied — v5 schema live in production DB
- [x] Core stocks + concepts seeded
- [x] 24 v5 stocks seeded to PostgreSQL
- [x] PM2 `fortress` process running on port 3000
- [x] GitHub secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` set

## ⏳ Pending / Next Steps
1. **Confirm CI pipeline green** — latest run `dd2ecfc` should be the first clean automated deploy.
2. **Nginx reverse proxy** — currently app is on `:3000` directly. Set up Nginx to serve on port 80/443 with SSL.
3. **Mobile polish** — v5 dense data cards need responsive review on small viewports.
4. **Real-time data** — replace static curated scans with live NSE/BSE market data API.
5. **Admin: v5 Stock Editor** — UI to create/edit v5 stock entries (currently read-only).

## Maintenance Commands
```bash
# On VPS — manual update
cd /opt/fortress
git pull origin main && npm ci && npm run build && pm2 restart fortress --update-env && pm2 save

# Schema changes (always prefix DATABASE_URL)
DATABASE_URL=postgresql://fortress_user:PASSWORD@localhost:5432/fortress npm run drizzle:push

# Reseed if needed
curl http://localhost:3000/api/seed
curl "http://localhost:3000/api/seed?target=v5"

# Monitor
pm2 status
pm2 logs fortress --lines 50
```
