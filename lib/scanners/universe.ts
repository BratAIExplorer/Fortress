// Live, free, unauthenticated ticker universes for the scanner — no paid data plan needed.
// Replaces hand-typed ticker arrays that silently cap what the scanner can ever find.
import { readFile } from "fs/promises";
import path from "path";

const US_FALLBACK = [
  "AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "AMD", "INTC", "QCOM",
];

// Real Nifty 50 constituents — safe to hand-maintain (large, stable names; NSE reconstitutes ~2x/year).
// This is the floor when neither the static Nifty 500 file nor the live NSE fetch is available.
const NSE_FALLBACK = [
  "RELIANCE", "TCS", "HDFCBANK", "ICICIBANK", "INFY", "HINDUNILVR", "ITC", "SBIN",
  "BHARTIARTL", "KOTAKBANK", "LT", "AXISBANK", "BAJFINANCE", "ASIANPAINT", "MARUTI",
  "HCLTECH", "SUNPHARMA", "TITAN", "ULTRACEMCO", "WIPRO", "ONGC", "NTPC", "POWERGRID",
  "M&M", "TATAMOTORS", "TATASTEEL", "JSWSTEEL", "ADANIENT", "ADANIPORTS", "COALINDIA",
  "BAJAJFINSV", "NESTLEIND", "TECHM", "INDUSINDBK", "GRASIM", "HDFCLIFE", "SBILIFE",
  "DRREDDY", "CIPLA", "DIVISLAB", "EICHERMOT", "BRITANNIA", "BPCL", "HEROMOTOCO",
  "APOLLOHOSP", "UPL", "BAJAJ-AUTO", "HINDALCO", "LTIM",
];

const US_UNIVERSE_URL = "https://raw.githubusercontent.com/datasets/s-and-p-500-companies/master/data/constituents.csv";
const NSE_UNIVERSE_URL = "https://archives.nseindia.com/content/indices/ind_nifty500list.csv";
// ponytail: manually refreshed static Nifty 500 snapshot — NSE's Akamai bot-protection blocks
// server-side fetches from datacenter IPs (confirmed: even the homepage 403s), so headers/cookies
// can't fix this. Regenerate every ~6 months by running Reference/OutoftheBox/fetch_nifty500.py
// from a non-datacenter network (laptop/office wifi, not the VPS) and committing the output here.
const NSE_STATIC_FILE = path.join(process.cwd(), "lib", "scanners", "nifty500-static.csv");
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h — index membership barely changes day to day

const cache = new Map<string, { tickers: string[]; fetchedAt: number }>();

async function fetchCsvTickers(url: string, symbolColumnIndex: number, headers?: Record<string, string>): Promise<string[]> {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`universe fetch failed: ${res.status}`);
  const csv = await res.text();
  return parseCsvTickers(csv, symbolColumnIndex);
}

function parseCsvTickers(csv: string, symbolColumnIndex: number): string[] {
  return csv
    .split("\n")
    .slice(1) // header row
    .map(line => line.split(",")[symbolColumnIndex]?.trim())
    .filter(Boolean);
}

async function getNSETickers(): Promise<string[]> {
  // 1. Manually refreshed static snapshot — most reliable source given NSE's server-side block
  try {
    const csv = await readFile(NSE_STATIC_FILE, "utf-8");
    const tickers = parseCsvTickers(csv, 2);
    if (tickers.length >= 100) return tickers;
  } catch {
    // file doesn't exist yet — fall through
  }

  // 2. Live fetch — works if this environment's IP isn't blocked (untested on VPS)
  try {
    const tickers = await fetchCsvTickers(NSE_UNIVERSE_URL, 2, {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    });
    if (tickers.length >= 100) return tickers;
  } catch {
    // blocked or unreachable — fall through
  }

  // 3. Hardcoded Nifty 50 floor
  return NSE_FALLBACK;
}

async function getUniverse(key: "US" | "NSE"): Promise<string[]> {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) return cached.tickers;

  let tickers: string[];
  if (key === "NSE") {
    tickers = await getNSETickers();
  } else {
    try {
      tickers = await fetchCsvTickers(US_UNIVERSE_URL, 0);
      if (tickers.length < 100) throw new Error("universe list looked truncated");
    } catch {
      tickers = US_FALLBACK;
    }
  }

  cache.set(key, { tickers, fetchedAt: Date.now() });
  return tickers;
}

export const getUSUniverse = () => getUniverse("US");
export const getNSEUniverse = () => getUniverse("NSE");
