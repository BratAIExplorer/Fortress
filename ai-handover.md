# Fortress Intelligence: Senior AI Handover & Infrastructure Blueprint

## 🎯 Product Vision (PO Perspective)
Fortress Intelligence is designed as a mission-critical financial analysis engine. The infrastructure Goal is **Zero-Interference Hosting**. The current setup allows the business to scale to dozens of independent "Fortresses" (client instances or new projects) on a single VPS with institutional-grade isolation.

## 🏗️ Architecture & Isolation Strategy
We utilize a **Vertical Sandbox** approach:
- **Process Isolation (PM2)**: Each app is a distinct OS process.
- **Dependency Isolation (Standalone Build)**: We use Next.js `standalone` to lock dependencies per project, preventing "shared library" hell.
- **Port Mapping**: A structured port-range strategy (3000, 3001, etc.) handled by Nginx.
- **Data Level**: Every project uses a unique PostgreSQL user and database (see `scripts/create-db-user.sql`).

## 🚀 v5 Extension (Mar 2026 Update)
The application has been extended to include specialized deep-value scans previously maintained in manual JSX files:
- **Data Layer**: Enhanced `Stock` types in `lib/types.ts` to support narratives ("Why It Fell", "Multi-Bagger Case").
- **Institutional Scans**: A new `/v5-extension` route provides tabbed access to "52W Lows", "Qualified Penny", and "Sub-₹10 Speculative" lists.
- **Admin layer**: The `/admin/theses` portal enables CRUD operations on investment arguments, protected by NextAuth.js.

## 🔑 Authentication (NextAuth.js v5)
We have migrated from Basic Auth to **NextAuth.js (Auth.js v5)** for industrial-grade security:
- **Provider**: `CredentialsProvider` using `ADMIN_SECRET` as the password for account `admin`.
- **Middleware**: Routes under `/admin` are automatically protected and redirect to `/login`.
- **System Integrity**: Replaced manual `proxy.ts` (Next.js Edge Proxy convention) with standard Auth.js handlers.

## 🎨 Visual Identity
- **Fonts**: Re-implemented **DM Sans** (Sans) and **IBM Plex Mono** (Mono) via `next/font/google` to match the original design spec.
- **Tailwind**: Mapped font variables to the Tailwind theme in `globals.css`.

## CI/CD Pipeline
- **GitHub Actions**: Configured in `.github/workflows/ci.yml`.
- **Workflow**:
  1. Build & Test on every push.
  2. Deploy to VPS via SSH on `main` branch push.
  3. Uses Next.js `standalone` output for minimal package size.

## Key Technical Decisions
1.  **Standalone Output**: Chosen to ensure the VPS deployment is lightweight.
2.  **v5 Data Seeding**: Specialized lists are currently stored in `lib/mock-data.ts` and can be fetched via `app/actions.ts`.
3.  **UI Primitives**: Built custom `Tabs`, `Input`, and `Textarea` to maintain high speed without heavy external deps.

## ✅ Completion Status
- [x] **v5 Data Migration**: All manual entries from `fortress-v5.jsx` are ported to the Next.js data layer.
- [x] **Institutional UI**: Replicated the "Shield/Warrior" aesthetic in `/v5-extension`.
- [x] **Admin Thesis Management**: Full CRUD live at `/admin/theses`.
- [x] **Build Verification**: Production build confirmed stable (`npm run build`).

## ⏳ Pending / Next Steps
1.  **Live Database Sync**: Migrate the new v5 mock entries into the production PostgreSQL database.
2.  **VPS Deployment**: Execute `scripts/deploy-vps.sh` from the runner to verify the updated standalone build on the server.
3.  **Mobile Polish**: Ensure the denser data cards in the v5 extension are fully responsive on small viewports.

## Maintenance Commands
```bash
# Update everything
git pull origin main && npm ci && npm run build && pm2 reload fortress-app

# Monitor health
pm2 status
pm2 logs fortress-app
```
