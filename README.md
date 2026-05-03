# Fortress Intelligence

**Investment allocation engine with real-time stock screening across US and India markets.**

## 🚀 Live

- **App:** https://fortressintelligence.space
- **Status:** Beta live (v0.4.0) - Public testing
- **Markets:** US (346 candidates), India NSE (placeholder, scanning)

## Features

### Investment Genie
Multi-market portfolio allocation based on user risk profile:
- Select markets (US, India)
- Receive AI-optimized allocation percentages
- Allocations powered by real-time stock screening

### Fortress 30
Real-time stock screening:
- **Safe Core** - High-quality dividend-paying stocks (US: tested, India: ready)
- **Growth** - Momentum-driven candidates (US: 346 live, India: awaiting NSE scan)
- Market-specific filtering and ranking

### Design
- Dark Luxury theme (modern, professional, accessible)
- Fully responsive (desktop, tablet, mobile)
- Dark mode by default with smooth interactions

## 🏗 Architecture

```
Frontend (Next.js)
  ├── Investment Genie (Form + Results)
  ├── Fortress 30 (Stock Screening)
  └── Responsive UI + Dark Theme

Backend (Next.js API)
  ├── /api/allocation/generate - Portfolio allocation
  ├── /api/stocks/screen - Stock filtering
  └── /api/market/scan - Market data updates

Database (PostgreSQL)
  ├── stocks (indexed, searchable)
  ├── scans (market scanning history)
  ├── scan_results (per-stock ratings)
  └── sectors (market structure)

Scanner (Python)
  ├── yfinance (US market data)
  ├── NSE API (India market - setup ready)
  └── Daily cron jobs (automated updates)
```

## 📊 Market Data

**US Market (LIVE)**
- 346 quality candidates indexed
- Scan: 9:30 AM EST, Monday-Friday
- Status: Actively updating

**India/NSE (READY)**
- Placeholder structure deployed
- Scanner: Awaiting yfinance recovery
- Scan: 9:30 AM IST, Tuesday-Friday (when yfinance recovers)
- ETA: 24-48 hours

## 🛠 Development

### Local Setup
```bash
# Clone
git clone https://github.com/BratAIExplorer/Fortress.git
cd fortress-app

# Install
npm install

# Environment
cp .env.example .env.local
# Add DATABASE_URL=postgresql://...

# Run
npm run dev
# Open http://localhost:3000
```

### Tech Stack
- **Frontend:** Next.js 14, TypeScript, TailwindCSS
- **Backend:** Next.js API routes
- **Database:** PostgreSQL (Supabase compatible)
- **Data:** yfinance, NSE APIs (in setup)
- **Deployment:** Docker, PM2, Nginx, GitHub Actions CI/CD

## 🚀 Deployment

**Production:** VPS 76.13.179.32
- App: Port 3001 (via Nginx reverse proxy)
- Database: PostgreSQL locally
- Deployment: Automated via GitHub Actions

**Deploy Command:**
```bash
git push origin main
# CI/CD handles: build → test → deploy → restart
```

## 📝 Documentation

- [Project Status Report](PROJECT_STATUS_REPORT.md) - Current state & backlog
- [ARCHITECTURE.md](ARCHITECTURE.md) - System design & API docs
- [ROADMAP.md](ROADMAP.md) - Features & timeline
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - VPS setup & ops

## 📅 Roadmap

**Now (Beta Live)**
- ✅ Investment Genie (multi-market allocation)
- ✅ Fortress 30 (stock screening, US live)
- ✅ Dark Luxury theme
- 🔄 NSE market data (auto-recovery, 24-48h)

**Month 2+ (Backlog)**
- Investment Genie feedback loop (after 50+ users)
- Advanced analytics & recommendations
- Expanded market coverage
- Real-time alerts & monitoring

## 🆘 Support

**Issues?**
- Check [PROJECT_STATUS_REPORT.md](PROJECT_STATUS_REPORT.md) for known issues
- For bugs: Open a GitHub issue

## 📄 License

MIT

---

**Last Updated:** May 3, 2026 | **Version:** 0.4.0-beta
