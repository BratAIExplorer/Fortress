/**
 * Fortress Scanner Cron Scheduler
 * Runs NSE and US scans on a fixed schedule via PM2
 *
 * Schedule:
 * - NSE: Mon-Fri 4:30 AM IST (11:00 UTC)
 * - US: Mon-Fri 2:30 PM IST (9:00 UTC)
 */

const cron = require('node-cron');

const BASE_URL = process.env.SCANNER_BASE_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET;

if (!CRON_SECRET) {
  console.warn('⚠️  CRON_SECRET not set — scanners will not run');
  process.exit(1);
}

async function runScan(market) {
  try {
    console.log(`[${new Date().toISOString()}] 🔄 Starting ${market} scan...`);

    const response = await fetch(`${BASE_URL}/api/scan/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cron-secret': CRON_SECRET,
      },
      body: JSON.stringify({ market, weights: { l1: 25, l2: 20, l3: 10, l4: 25, l5: 15, l6: 5 } }),
    });

    const data = await response.json();
    if (response.ok || response.status === 202) {
      console.log(`✅ ${market} scan accepted (ID: ${data.scanId})`);
    } else {
      console.error(`❌ ${market} scan failed:`, data.error);
    }
  } catch (error) {
    console.error(`❌ ${market} scan error:`, error.message);
  }
}

async function fetchYahooPrice(ticker) {
  try {
    const response = await fetch(`https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=price`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.quoteSummary?.result?.[0]?.price?.regularMarketPrice ?? null;
  } catch (error) {
    console.warn(`⚠️  Failed to fetch ${ticker}:`, error.message);
    return null;
  }
}

async function runMacroSnapshot() {
  try {
    console.log(`[${new Date().toISOString()}] 📊 Fetching macro snapshot...`);

    const snapshot = {
      snapshot_date: new Date().toISOString().split('T')[0],
      nifty_50: await fetchYahooPrice('%5ENSEI'),
      bank_nifty: await fetchYahooPrice('%5ENSEBANK'),
      usd_inr: await fetchYahooPrice('USDINR%3DNS'),
      gold_usd: await fetchYahooPrice('GC%3DF'),
      crude_oil_usd: await fetchYahooPrice('CL%3DF'),
      us_10y_yield: await fetchYahooPrice('%5ETNX'),
      cboe_vix: await fetchYahooPrice('%5EVIX'),
      india_vix: await fetchYahooPrice('INDIA.VIX'),
    };

    const response = await fetch(`${BASE_URL}/api/macro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cron-secret': CRON_SECRET,
      },
      body: JSON.stringify(snapshot),
    });

    if (response.ok || response.status === 201) {
      console.log(`✅ Macro snapshot posted`);
    } else {
      const error = await response.json();
      console.error(`❌ Macro snapshot failed:`, error.error);
    }
  } catch (error) {
    console.error(`❌ Macro snapshot error:`, error.message);
  }
}

// NSE: Every Monday-Friday at 4:30 AM IST (11:00 UTC)
// Cron format: minute hour day-of-month month day-of-week
// 0 11 * * 1-5 = 11:00 UTC every weekday
cron.schedule('0 11 * * 1-5', () => {
  runScan('NSE').catch(err => console.error('NSE cron error:', err));
}, { timezone: 'UTC' });

// US: Every Monday-Friday at 2:30 PM IST (9:00 UTC)
// 0 9 * * 1-5 = 09:00 UTC every weekday
cron.schedule('0 9 * * 1-5', () => {
  runScan('US').catch(err => console.error('US cron error:', err));
}, { timezone: 'UTC' });

// Macro Snapshot: Every Sunday at 12:00 UTC (5:30 PM IST)
// 0 12 * * 0 = 12:00 UTC every Sunday
cron.schedule('0 12 * * 0', () => {
  runMacroSnapshot().catch(err => console.error('Macro snapshot cron error:', err));
}, { timezone: 'UTC' });

console.log('🟢 Fortress Scanner Cron Scheduler started');
console.log('  NSE: Mon-Fri 11:00 UTC (4:30 AM IST)');
console.log('  US:  Mon-Fri 09:00 UTC (2:30 PM IST)');
console.log('  Macro: Sunday 12:00 UTC (5:30 PM IST)');
console.log('');

// Keep process alive
setInterval(() => {
  // heartbeat
}, 60000);
