# Fortress Intelligence 🛡️

Institutional-grade financial analysis engine for Indian equity markets. 

## 🚀 Project Status: Production Ready
As of March 10, 2026, the project is fully deployed and functional on the production VPS (`srv1327289`).

## 🏗️ Core Architecture
- **Framework**: Next.js 16 (App Router + `proxy.ts` for Auth)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Infrastructure**: PM2 managed processes on Hostinger VPS
- **CI/CD**: GitHub Actions with hardened native SSH deployment

## 🎯 Key Features
- **v5 Extension**: Specialized deep-value scans (52W Lows, Qualified Penny stocks).
- **Admin Engine**: CRUD management for investment theses at `/admin/theses`.
- **Zero-Interference Hosting**: Optimized standalone builds for institutional isolation.

## 🔑 Documentation References
For detailed infrastructure setup, key configurations, and handover details, see:
- [AI Handover & Infrastructure Blueprint](ai-handover.md)

## 🛠️ Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the local dashboard.

## 🚢 Deployment
Deployment is automated via GitHub Actions on every push to `main`. 
Manual maintenance commands can be found in [ai-handover.md](ai-handover.md#maintenance-commands).
