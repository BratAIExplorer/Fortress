# Fortress Intelligence - Technical Architecture

**Version:** 0.4.0 | **Status:** Production Live | **Date:** May 2026

---

## System Overview

Fortress Intelligence is a full-stack investment allocation and stock screening platform with real-time market data pipelines. The system integrates frontend portfolio allocation (Investment Genie) with backend stock screening (Fortress 30) powered by Python-based market scanners.

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERFACE LAYER                         │
│                   (Next.js 15 / React 19)                       │
├─────────────────────────────────────────────────────────────────┤
│  Investment Genie Form          │  Fortress 30 Stock Screening  │
│  - Market selector              │  - Ranked candidate list      │
│  - Risk/age/horizon input       │  - Score breakdown (L1-L6)    │
│  - Allocation results           │  - Multi-bagger & Coffee Can  │
│  - Sector breakdown             │  - Megatrend tags             │
├─────────────────────────────────────────────────────────────────┤
│                    API ROUTE HANDLERS                           │
│                  (Next.js API Routes - /api)                    │
├─────────────────────────────────────────────────────────────────┤
│  POST /api/allocation/generate  │  GET /api/stocks/screen       │
│  - Input: user profile          │  - Query: market, sector, etc │
│  - Return: allocation %         │  - Return: ranked candidates  │
│  - Allocates to 6 portfolio     │                               │
│    layers (Safe, Growth, etc)   │  GET /api/market/scan         │
│                                 │  - Trigger: manual scan start │
│                                 │  - Return: scan status        │
├─────────────────────────────────────────────────────────────────┤
│                    DATA PERSISTENCE LAYER                       │
│              (PostgreSQL 14+ on VPS 76.13.179.32)               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Core Tables                                             │   │
│  │ • stocks (id, symbol, name, market, sector)           │   │
│  │ • scans (id, market, status, started_at, duration_ms)  │   │
│  │ • scan_results (25+ columns: scores, tiers, tags)      │   │
│  │ • sectors (id, market, sector_name, company_count)     │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                   DATA INGESTION LAYER                          │
│         (Python Scanner Pipeline on VPS /opt/fortress)          │
├─────────────────────────────────────────────────────────────────┤
│  scanner_db_writer.py                                           │
│  - Orchestrates scan lifecycle                                  │
│  - Inserts scan record → status=RUNNING                         │
│  - Calls scanner engine                                         │
│  - Writes scan_results to DB                                    │
│  - Updates scan → status=COMPLETED                              │
│                                                                  │
│  scanner.py (v3)                                                │
│  - L1-L6 multi-layer scoring                                    │
│  - Multi-Bagger runway + compounding                            │
│  - Coffee Can 4-year consistency                                │
│  - Auto-NLP Megatrends (EV, Defence, China+1, etc)            │
│  - Benchmark awareness (^NSEI, ^GSPC)                           │
│                                                                  │
│  run_scan.sh (Cron trigger)                                     │
│  - US: 9:30 AM EST (Mon-Fri)                                    │
│  - NSE: 9:30 AM IST (Tue-Fri)                                   │
│                                                                  │
│  Watchlists (Reference/OutoftheBox/)                            │
│  - NSE: all_nse_stocks.csv, nifty500.csv                        │
│  - US: sp500.csv, sp500_stocks.py (fallback crawler)            │
│                                                                  │
│  Data Sources                                                   │
│  - yfinance (US & NSE stock data, fundamentals)                 │
│  - NSE API (India market structure)                             │
│  - Custom benchmark data (macro trends)                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
fortress/
├── fortress-app/                    # Next.js application root
│   ├── app/                         # Next.js app directory
│   │   ├── layout.tsx               # Root layout (theme provider)
│   │   ├── page.tsx                 # Homepage
│   │   ├── investment-genie/        # Genie feature
│   │   │   ├── page.tsx             # Form & results
│   │   │   └── layout.tsx           # Feature-level layout
│   │   ├── fortress-30/             # Stock screening
│   │   │   ├── page.tsx             # Market-filtered display
│   │   │   └── layout.tsx
│   │   └── api/                     # API routes
│   │       ├── allocation/
│   │       │   └── generate.ts      # Portfolio allocation endpoint
│   │       ├── stocks/
│   │       │   └── screen.ts        # Stock screening endpoint
│   │       └── market/
│   │           └── scan.ts          # Manual scan trigger
│   │
│   ├── components/                  # Reusable React components
│   │   ├── InvestmentGenieForm.tsx  # Form input component
│   │   ├── AllocationResults.tsx    # Results display
│   │   ├── ScannerCandidateCard.tsx # Stock card component
│   │   ├── MarketSelector.tsx       # Market toggle
│   │   └── ThemeProvider.tsx        # Dark/light theme context
│   │
│   ├── lib/                         # Business logic & utilities
│   │   ├── investment-genie/        # Allocation engine
│   │   │   ├── contracts.ts         # Type definitions
│   │   │   ├── allocation-engine.ts # Core algorithm
│   │   │   └── market-weights.ts    # Market allocation percentages
│   │   │
│   │   ├── database/                # Database access
│   │   │   ├── client.ts            # PostgreSQL client setup
│   │   │   ├── queries.ts           # Prepared statements
│   │   │   └── schema.ts            # TypeScript schema
│   │   │
│   │   ├── validation.ts            # Input validation schemas
│   │   └── utils.ts                 # General utilities
│   │
│   ├── __tests__/                   # Unit & integration tests
│   │   ├── allocation-engine.test.ts
│   │   ├── stock-screening.test.ts
│   │   └── api-endpoints.test.ts
│   │
│   ├── e2e/                         # End-to-end tests
│   │   ├── investment-genie.spec.ts
│   │   ├── fortress-30.spec.ts
│   │   └── multi-market.spec.ts
│   │
│   ├── .env.local                   # Database URL (not in git)
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.js
│
├── Reference/OutoftheBox/           # Data & watchlists
│   ├── all_nse_stocks.csv           # Full NSE stock list
│   ├── nifty500.csv                 # Nifty 500 watchlist
│   ├── sp500.csv                    # S&P 500 list
│   ├── sp500_stocks.py              # Fallback crawler for US data
│   └── nifty500_stocks.py           # NSE data fetch utility
│
├── scanner/                         # Python scanner pipeline
│   ├── scanner.py                   # Core scoring engine (v3)
│   ├── scanner_db_writer.py         # Database orchestration
│   ├── run_scan.sh                  # Cron entry point
│   ├── requirements.txt              # Python dependencies
│   └── tests/                       # Scanner unit tests
│
├── ARCHITECTURE.md                  # This file
├── DEPLOYMENT_GUIDE.md              # VPS setup & operations
├── API_DOCUMENTATION.md             # Endpoint specifications
├── DEVELOPMENT_SETUP.md             # Local environment
├── ROADMAP.md                       # Feature timeline
├── PROJECT_STATUS_REPORT.md         # Current state
└── README.md                        # Project overview
```

---

## Database Schema

### Core Tables

**stocks**
```sql
CREATE TABLE stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol VARCHAR(10) NOT NULL,        -- RELIANCE.NS or MSFT
  name VARCHAR(255),                  -- Company name
  market VARCHAR(3) NOT NULL,         -- 'NSE' or 'US'
  sector VARCHAR(100),                -- Industry sector
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(symbol, market)
);
```

**scans**
```sql
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market VARCHAR(3) NOT NULL,         -- 'NSE' or 'US'
  status VARCHAR(20),                 -- RUNNING, COMPLETED, FAILED
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**scan_results** (25+ columns)
```sql
CREATE TABLE scan_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES scans(id),
  symbol VARCHAR(10) NOT NULL,
  market VARCHAR(3) NOT NULL,
  
  -- Layer scores (L1-L6)
  l1_score FLOAT,                     -- Solvency
  l2_score FLOAT,                     -- Pricing Power
  l3_score FLOAT,                     -- Relative Strength
  l4_score FLOAT,                     -- Growth
  l5_score FLOAT,                     -- Governance
  l6_score FLOAT,                     -- Valuation
  total_score FLOAT,
  category VARCHAR(50),               -- Tier classification
  
  -- Multi-Bagger score
  mb_score FLOAT,
  mb_tier VARCHAR(20),
  
  -- Coffee Can score
  cc_score FLOAT,
  cc_tier VARCHAR(20),
  
  -- Megatrend
  megatrend_tag VARCHAR(100),
  megatrend_emoji VARCHAR(10),
  
  -- Fundamentals
  fcf_yield FLOAT,
  earnings_quality FLOAT,
  peg_ratio FLOAT,
  de_direction VARCHAR(20),
  margin_direction VARCHAR(20),
  revenue_cagr FLOAT,
  years_checked INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

**sectors**
```sql
CREATE TABLE sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market VARCHAR(3) NOT NULL,
  sector_name VARCHAR(100),
  company_count INTEGER,
  avg_score FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoints

### POST /api/allocation/generate

Generates portfolio allocation based on user risk profile.

**Request:**
```json
{
  "age": 35,
  "investmentAmount": 100000,
  "timeHorizonYears": 20,
  "riskAppetite": "moderate",
  "selectedMarkets": ["US", "NSE"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "layers": [
      {
        "name": "Safe Core",
        "allocation": 40.1,
        "candidates": [
          {
            "symbol": "JNJ",
            "market": "US",
            "reason": "Dividend consistency, stable growth"
          }
        ]
      },
      {
        "name": "Growth",
        "allocation": 25.1,
        "candidates": [
          {
            "symbol": "RELIANCE.NS",
            "market": "NSE",
            "reason": "Strong momentum, quality metrics"
          }
        ]
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid input: age must be between 18 and 100"
}
```

---

### GET /api/stocks/screen

Returns ranked stock candidates based on market and filters.

**Query Parameters:**
- `market`: 'NSE' | 'US' | 'ALL'
- `sector`: Filter by sector (optional)
- `limit`: Number of results (default: 30)
- `minScore`: Minimum total score (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "market": "NSE",
    "totalCount": 346,
    "candidates": [
      {
        "symbol": "RELIANCE.NS",
        "name": "Reliance Industries",
        "market": "NSE",
        "sector": "Energy",
        "totalScore": 85.3,
        "l1Score": 92,
        "l2Score": 88,
        "l3Score": 81,
        "l4Score": 79,
        "l5Score": 84,
        "l6Score": 77,
        "mbScore": 8.5,
        "mbTier": "Strong",
        "ccScore": 7.2,
        "ccTier": "Quality",
        "megatrendTag": "Energy Transition",
        "megatrendEmoji": "⚡"
      }
    ]
  }
}
```

---

### GET /api/market/scan

Initiates a manual market scan or returns current scan status.

**Query Parameters:**
- `market`: 'NSE' | 'US' (required)
- `action`: 'trigger' | 'status' (default: 'status')

**Trigger Scan Request:**
```
GET /api/market/scan?market=NSE&action=trigger
```

**Response:**
```json
{
  "success": true,
  "data": {
    "scanId": "uuid-here",
    "market": "NSE",
    "status": "RUNNING",
    "startedAt": "2026-05-03T10:30:00Z",
    "estimatedDuration": "45 seconds"
  }
}
```

---

## Frontend Components

### InvestmentGenieForm
- Collects user inputs (age, amount, horizon, risk, markets)
- Validates inputs with Zod schemas
- Submits to `/api/allocation/generate`
- Displays results with sector breakdown

### Fortress30Page
- Queries `/api/stocks/screen` with market parameter
- Displays ranked candidates
- Shows score breakdown (L1-L6)
- Responsive grid layout (1-3 columns based on viewport)

### MarketSelector
- Toggle between NSE and US markets
- Provides context via React Context
- Updates URL search parameters

### ScannerCandidateCard
- Displays individual stock results
- Shows score tiers (L1-L6, MB, CC)
- Displays megatrend tags
- Responsive design

---

## Data Flow

### Investment Genie Flow
```
1. User selects markets (US, NSE) and enters profile
   ↓
2. Form submitted to POST /api/allocation/generate
   ↓
3. Backend queries scan_results for each market
   ↓
4. Allocation engine distributes % across 6 layers
   ↓
5. Top candidates selected per layer per market
   ↓
6. Results displayed with sector breakdown
```

### Stock Screening Flow
```
1. Cron triggers scanner at 9:30 AM market time
   ↓
2. scanner_db_writer.py starts, creates scan record
   ↓
3. Loads watchlist (all_nse_stocks.csv or sp500.csv)
   ↓
4. For each stock:
   - Fetch data from yfinance
   - Calculate L1-L6 scores
   - Calculate MB score
   - Calculate CC score
   - Generate megatrend tag
   ↓
5. Insert batch into scan_results
   ↓
6. Update scan record → status=COMPLETED
   ↓
7. Frontend queries via /api/stocks/screen
```

---

## Deployment Architecture

### Frontend Hosting
- **Server:** VPS 76.13.179.32
- **Port:** 3001 (internal) → 443 (Nginx reverse proxy)
- **Process Manager:** PM2
- **Auto-restart:** Enabled

### Backend Services
- **Next.js API Routes:** Runs on same process as frontend
- **Database:** PostgreSQL on localhost:5432
- **Scanner:** Separate Python process, cron-scheduled

### Nginx Configuration
```nginx
upstream fortress_backend {
  server 127.0.0.1:3001;
}

server {
  listen 443 ssl http2;
  server_name fortressintelligence.space;
  
  ssl_certificate /etc/letsencrypt/live/fortressintelligence.space/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/fortressintelligence.space/privkey.pem;
  
  location / {
    proxy_pass http://fortress_backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

---

## Security & Performance

### Input Validation
- Zod schemas on all API endpoints
- Parameterized SQL queries (Drizzle ORM)
- XSS protection via React auto-escaping

### Performance Optimizations
- Database indexes on `symbol`, `market`, `scan_id`
- Batch inserts for scan_results (1000s of rows)
- Frontend caching via React Query
- Responsive images with Next.js Image component

### Error Handling
- Try-catch blocks at route level
- Error boundary component for UI crashes
- Detailed logging on backend
- User-friendly error messages in responses

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Next.js | 15.x |
| | React | 19.x |
| | TypeScript | 5.x |
| | TailwindCSS | 3.x |
| **Backend** | Node.js | 20+ |
| | Drizzle ORM | Latest |
| **Database** | PostgreSQL | 14+ |
| **Scanner** | Python | 3.9+ |
| | yfinance | Latest |
| **DevOps** | GitHub Actions | Latest |
| | PM2 | 5.x |
| | Nginx | 1.x |

---

## Known Limitations & Roadmap

### Current Limitations
- NSE data scanning blocked by yfinance rate limits (auto-recovery expected)
- Fortress 30 market-switch UI state sync issue (cosmetic, non-blocking)
- Single VPS deployment (no redundancy yet)

### Planned Improvements
- Investment Genie feedback loop (5-7 hours, Month 2+)
- NSE data expansion with 100%+ candidates
- Advanced filtering (PE ratio, dividend yield, etc)
- Export functionality (PDF, CSV)
- User preference persistence (if auth added)

---

## Monitoring & Alerts

### Key Metrics to Watch
1. **Scan Completion Rate** — Should be 100% Mon-Fri
2. **API Response Time** — Target <500ms for /api/stocks/screen
3. **Database Query Time** — Monitor slow queries log
4. **yfinance Rate Limit** — Check scan logs for timeout errors

### Health Checks
```bash
# Frontend availability
curl -s https://fortressintelligence.space | grep -q "Fortress" && echo "OK"

# Backend API
curl -s https://fortressintelligence.space/api/stocks/screen?market=US | grep -q "success"

# Scanner logs
ssh root@76.13.179.32 "tail -f /opt/fortress/scanner/scan.log"
```

---

## Further Reading
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) — VPS operations
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) — Detailed endpoints
- [DEVELOPMENT_SETUP.md](DEVELOPMENT_SETUP.md) — Local environment
- [ROADMAP.md](ROADMAP.md) — Feature timeline
