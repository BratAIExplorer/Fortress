# Fortress Intelligence - Development Setup Guide

**Last Updated:** May 2026 | **Target Node:** 20+ | **Database:** PostgreSQL 14+ local

This guide covers setting up a local development environment for the Fortress Intelligence platform.

---

## Prerequisites

Before starting, ensure you have installed:

**Required:**
- Node.js 20.x (or latest LTS) — Download from https://nodejs.org
- npm 10.x (comes with Node.js)
- PostgreSQL 14+ — Download from https://www.postgresql.org/download
- Git — Download from https://git-scm.com
- VS Code (recommended) or your preferred TypeScript IDE

**Optional but helpful:**
- Postman or Insomnia (API testing)
- DBeaver (Database GUI)
- Python 3.9+ (if running scanner locally)

**Verify installations:**
```bash
node --version     # v20.x.x
npm --version      # 10.x.x
psql --version     # psql (PostgreSQL) 14.x or later
git --version      # git version 2.x.x
```

---

## Step 1: Clone the Repository

```bash
# Clone from GitHub
git clone https://github.com/BratAIExplorer/Fortress.git
cd Fortress

# Enter the Next.js app directory
cd fortress-app
```

---

## Step 2: Set Up Local PostgreSQL

### Create Database and User

**On macOS/Linux:**
```bash
# Start PostgreSQL service
brew services start postgresql  # macOS
# or
systemctl start postgresql      # Linux

# Connect to PostgreSQL as superuser
psql postgres

# In the psql prompt, run:
CREATE USER fortress_dev WITH PASSWORD 'fortress_dev_local';
CREATE DATABASE fortress_dev OWNER fortress_dev;

# Exit psql
\q
```

**On Windows:**
```bash
# PostgreSQL should be running from the installer
# Open Command Prompt or PowerShell as Administrator

# Connect to PostgreSQL (default user is 'postgres')
psql -U postgres

# In the psql prompt, run:
CREATE USER fortress_dev WITH PASSWORD 'fortress_dev_local';
CREATE DATABASE fortress_dev OWNER fortress_dev;

# Exit psql
\q
```

### Verify Connection

```bash
# Test connection with the new user
psql -U fortress_dev -d fortress_dev -h localhost

# You should see the postgres=# prompt
\q
```

---

## Step 3: Configure Environment Variables

**Create .env.local file in fortress-app/:**

```bash
cd /path/to/Fortress/fortress-app
touch .env.local
```

**Add these variables to .env.local:**
```
# Database
DATABASE_URL=postgresql://fortress_dev:fortress_dev_local@localhost:5432/fortress_dev

# App configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development

# Optional: Scanner path (if running locally)
SCANNER_PATH=/path/to/Fortress/scanner
```

**Do NOT commit .env.local to git** — it contains sensitive credentials.

---

## Step 4: Initialize Database Schema

The database schema is defined in Drizzle migrations.

```bash
# From fortress-app directory

# Run migrations to create tables
npx drizzle-kit push:pg
```

**Expected output:**
```
✅ [db] Migrations run successfully
✅ Tables created: stocks, scans, scan_results, sectors
```

### Verify Schema

```bash
# Connect to local database
psql -U fortress_dev -d fortress_dev

# List tables
\dt

# Check structure of a table
\d stocks

# Exit
\q
```

---

## Step 5: Install Dependencies

```bash
# From fortress-app directory

npm install
```

This installs all dependencies defined in package.json:
- Next.js 15
- React 19
- TypeScript
- TailwindCSS
- Drizzle ORM
- Testing frameworks (Jest, Playwright)
- And others

**Expected time:** 2-5 minutes depending on internet speed

---

## Step 6: Seed Local Database (Optional)

To develop with sample data, seed the database:

```bash
# From fortress-app directory

npm run seed
```

This populates:
- 50 sample US stocks in the stocks table
- 50 sample NSE stocks
- 1-2 sample scans
- Sample scan_results with scores

**If seed script doesn't exist yet**, manually insert sample data:

```sql
-- Connect to fortress_dev
psql -U fortress_dev -d fortress_dev

-- Insert sample US stocks
INSERT INTO stocks (symbol, name, market, sector) VALUES
('AAPL', 'Apple Inc', 'US', 'Technology'),
('MSFT', 'Microsoft Corporation', 'US', 'Technology'),
('JNJ', 'Johnson & Johnson', 'US', 'Healthcare'),
('V', 'Visa Inc', 'US', 'Financials'),
('RELIANCE.NS', 'Reliance Industries', 'NSE', 'Energy');

-- Insert sample scan
INSERT INTO scans (market, status, started_at, completed_at, duration_ms) VALUES
('US', 'COMPLETED', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '2 minutes', 120000);

-- Query scan ID for next insert
SELECT id FROM scans WHERE market='US' LIMIT 1;
-- Copy the UUID returned

-- Insert sample results (replace scan_id with the UUID from above)
INSERT INTO scan_results (
  scan_id, symbol, market, 
  l1_score, l2_score, l3_score, l4_score, l5_score, l6_score, total_score,
  mb_score, mb_tier, cc_score, cc_tier,
  megatrend_tag, megatrend_emoji
) VALUES
('REPLACE_WITH_SCAN_ID', 'AAPL', 'US', 90, 88, 85, 87, 84, 79, 85.5, 8.2, 'Strong', 7.8, 'Quality', 'AI/Services', '📱'),
('REPLACE_WITH_SCAN_ID', 'MSFT', 'US', 92, 90, 87, 89, 86, 81, 87.5, 8.7, 'Strong', 8.1, 'Quality', 'Cloud/AI', '☁️');

-- Exit
\q
```

---

## Step 7: Start Development Server

```bash
# From fortress-app directory

npm run dev
```

**Expected output:**
```
> fortress-app@0.4.0 dev
> next dev

  ▲ Next.js 15.x.x
  - Local:        http://localhost:3000

✓ Ready in 2.3s
```

The app will be available at:
- **Frontend:** http://localhost:3000
- **API:** http://localhost:3000/api/*

---

## Step 8: Verify Setup

### 8.1 Frontend Test
```bash
# Open browser
open http://localhost:3000

# You should see:
# - Fortress Intelligence homepage
# - Investment Genie link
# - Fortress 30 link
# - Dark theme applied
```

### 8.2 API Test

**Test Investment Genie endpoint:**
```bash
curl -X POST http://localhost:3000/api/allocation/generate \
  -H "Content-Type: application/json" \
  -d '{
    "age": 35,
    "investmentAmount": 100000,
    "timeHorizonYears": 20,
    "riskAppetite": "moderate",
    "selectedMarkets": ["US"]
  }'

# You should see JSON response with allocation data
```

**Test Stock Screening endpoint:**
```bash
curl "http://localhost:3000/api/stocks/screen?market=US&limit=10"

# You should see JSON with stock candidates
```

### 8.3 Database Test

```bash
# From fortress-app directory, open a TypeScript test file to verify connection

npx ts-node -e "
import { db } from './lib/database/client';
db.query.stocks.findMany().then(stocks => {
  console.log('✅ Database connected');
  console.log('Stocks in DB:', stocks.length);
});
"
```

---

## Running Tests

### Unit Tests
```bash
# From fortress-app directory

npm test
```

This runs Jest tests in watch mode:
- Tests allocation engine logic
- Tests validation schemas
- Tests utility functions

**Expected output:**
```
PASS  __tests__/allocation-engine.test.ts
PASS  __tests__/stock-screening.test.ts
...
Test Suites: 3 passed, 3 total
Tests: 24 passed, 24 total
```

### E2E Tests (Playwright)
```bash
# Make sure dev server is running (npm run dev in another terminal)

npm run test:e2e
```

This runs browser automation tests:
- Tests Investment Genie form flow
- Tests Fortress 30 stock screening
- Tests multi-market functionality

**Expected output:**
```
Running 13 tests using 1 worker

✓ investment-genie.spec.ts (3 tests) 12s
✓ fortress-30.spec.ts (5 tests) 18s
✓ multi-market.spec.ts (5 tests) 15s

3 passed (45s)
```

### Test Coverage
```bash
npm test -- --coverage

# Generates coverage report in coverage/ directory
open coverage/lcov-report/index.html
```

Target: **80%+ coverage** across the codebase

---

## TypeScript & Linting

### Type Checking
```bash
# From fortress-app directory

npx tsc --noEmit

# Checks all TypeScript files for type errors
# Should show no errors for clean build
```

### ESLint
```bash
npm run lint

# Checks code style and common errors
# Fixes auto-fixable issues
npm run lint:fix
```

---

## Building for Production

```bash
# From fortress-app directory

npm run build

# Output: .next/standalone/ directory
# Ready for deployment
```

**Expected output:**
```
▲ Next.js 15.x.x
✓ Compiled successfully
✓ Exported to .next/standalone
```

---

## Running the Scanner Locally (Optional)

The Python scanner runs automatically on the VPS. To test locally:

### Install Python Dependencies

```bash
# From Fortress/scanner directory

cd ../scanner
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

pip install -r requirements.txt
```

### Run Scanner

```bash
# Set environment variable for database
export DATABASE_URL="postgresql://fortress_dev:fortress_dev_local@localhost:5432/fortress_dev"

# Run scanner for US market
python3 scanner_db_writer.py --market US

# Expected output:
# [10:30:15] Starting US scan...
# [10:30:16] Loaded 500 stocks from sp500.csv
# [10:32:30] Completed 500/500 scans
# [10:32:31] ✅ Scan completed successfully
```

**Note:** This will take 5-10 minutes and use yfinance (subject to rate limiting).

---

## IDE Setup (VS Code)

### Recommended Extensions

1. **ES7+ React/Redux/React-Native snippets**
   - Install: `ES7+ React/Redux/React-Native snippets`
   - Provides code snippets for React components

2. **TypeScript Vue Plugin**
   - Comes with VS Code
   - Provides TypeScript support in .ts/.tsx files

3. **Prettier - Code formatter**
   - Install: `Prettier - Code formatter`
   - Auto-formats code on save

4. **ESLint**
   - Install: `ESLint`
   - Shows linting issues inline

5. **Database Client (DBeaver)**
   - Optional: `DBeaver` extension for database browsing

### VS Code Settings

**Create .vscode/settings.json in fortress-app/:**
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

---

## Common Development Tasks

### Add a New API Endpoint

1. Create file: `fortress-app/app/api/[route]/route.ts`
2. Define request/response types
3. Implement handler function
4. Add test in `__tests__/api-endpoints.test.ts`
5. Document in API_DOCUMENTATION.md

### Modify Database Schema

1. Edit schema definition in `lib/database/schema.ts`
2. Generate migration: `npx drizzle-kit generate:pg`
3. Review migration in `drizzle/` directory
4. Run migration: `npx drizzle-kit push:pg`
5. Update TypeScript types if needed

### Add a New Component

1. Create file: `components/MyComponent.tsx`
2. Write TypeScript interface for props
3. Implement component with React hooks
4. Add test in `__tests__/components.test.ts`
5. Import and use in page

### Update Styling

The app uses **TailwindCSS** for styling:
1. Edit component className attributes
2. Use Tailwind utility classes
3. For custom styles: Add to `app/globals.css`
4. No CSS modules needed (Tailwind first)

---

## Troubleshooting

### Issue: "Cannot find module" errors

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Database connection refused

**Check PostgreSQL is running:**
```bash
# macOS
brew services list | grep postgres

# Linux
systemctl status postgresql

# Windows
# Check Services app for "PostgreSQL x.x" service
```

**Check .env.local DATABASE_URL is correct:**
```bash
# Should be: postgresql://fortress_dev:fortress_dev_local@localhost:5432/fortress_dev
cat .env.local | grep DATABASE_URL
```

### Issue: Port 3000 already in use

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm run dev
```

### Issue: Tests fail with "database not found"

**Solution:**
```bash
# Make sure database is created
psql -U fortress_dev postgres -c "CREATE DATABASE fortress_dev;"

# Or reset test database
npx drizzle-kit drop:pg
npx drizzle-kit push:pg
```

---

## Git Workflow

**Before starting work:**
```bash
# Ensure main is up to date
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
```

**While developing:**
```bash
# Commit frequently with clear messages
git add .
git commit -m "feat: add investment genie form validation"

# Push to feature branch
git push origin feature/your-feature-name
```

**When ready for review:**
```bash
# Create Pull Request on GitHub
# Link to relevant issues
# Describe changes and test plan
# Wait for code review and CI checks to pass
```

---

## Performance Tips

- **Use React DevTools profiler** to identify slow components
- **Enable Next.js analytics** to track page load times
- **Database indexes** on frequently queried columns (symbol, market)
- **Query batching** for multiple database operations
- **Code splitting** via Next.js dynamic imports

---

## Security in Development

- **Never commit .env.local** — it contains credentials
- **Use parameterized queries** (Drizzle ORM handles this)
- **Validate all user inputs** with Zod schemas
- **Test for SQL injection** in your test suite
- **Use HTTPS in production only** — HTTP localhost is fine for dev

---

## Further Reading

- [ARCHITECTURE.md](ARCHITECTURE.md) — System design
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) — VPS operations
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) — Endpoint specs
- [ROADMAP.md](ROADMAP.md) — Feature timeline
- Next.js Docs: https://nextjs.org/docs
- Drizzle ORM Docs: https://orm.drizzle.team
- TypeScript Handbook: https://www.typescriptlang.org/docs

---

## Getting Help

- **Type errors:** Run `npx tsc --noEmit` to see all TypeScript issues
- **Test failures:** Run tests with `npm test -- --verbose`
- **API issues:** Check response in Postman/Insomnia
- **Database issues:** Check logs with `psql -U fortress_dev -d fortress_dev -c "SHOW log_directory;"`

---

**Happy coding! 🚀**
