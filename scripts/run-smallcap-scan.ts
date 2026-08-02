/**
 * Smallcap Screen — live run
 *
 * Combines three things that already exist or were just added:
 *   1. Nifty 500 universe          (lib/scanners/nifty500-static.csv)
 *   2. Emerging-growth scoring     (lib/scanners/emerging-growth-scorer.ts)
 *   3. Liquidity / Trap Detector   (lib/scanners/liquidity-screen.ts)
 *
 * Prints a funnel so you can see exactly where names drop out. An empty final
 * list is a real result, not a bug — say so out loud rather than loosening the
 * thresholds until something appears.
 *
 * Run:
 *   npx -y tsx scripts/run-smallcap-scan.ts
 *   npx -y tsx scripts/run-smallcap-scan.ts --limit 100 --position 500000
 *
 * Requires outbound access to Yahoo Finance (works on the VPS and your laptop).
 */
import { readFile } from "fs/promises";
import path from "path";
import { scoreEmergingGrowth } from "../lib/scanners/emerging-growth-scorer";
import { fetchSmallcapFundamentals, type SmallcapRow } from "../lib/scanners/smallcap-fundamentals";

const GATES = {
  marketCapMinCrores: 300,
  marketCapMaxCrores: 10_000,
  growthMin: 0.25,
  roceMin: 0.15,
  peMax: 20,
  minQs: 6.5,
};

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i > -1 ? process.argv[i + 1] : undefined;
}

async function loadUniverse(limit?: number): Promise<string[]> {
  const csv = await readFile(
    path.join(process.cwd(), "lib", "scanners", "nifty500-static.csv"),
    "utf-8"
  );
  const symbols = csv
    .split("\n")
    .slice(1)
    .map((line) => line.split(",")[2]?.trim())
    .filter((s): s is string => Boolean(s));
  return limit ? symbols.slice(0, limit) : symbols;
}

function inr(n: number): string {
  if (n >= 1e7) return `${(n / 1e7).toFixed(1)}cr`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(1)}L`;
  return Math.round(n).toLocaleString();
}

async function main() {
  const limit = arg("--limit") ? Number(arg("--limit")) : undefined;
  const targetPosition = arg("--position") ? Number(arg("--position")) : 500_000; // ₹5L default

  const symbols = await loadUniverse(limit);
  console.log(`\nScanning ${symbols.length} NSE symbols · target position ₹${inr(targetPosition)}\n`);

  const started = Date.now();
  const { rows, failures } = await fetchSmallcapFundamentals(symbols, {
    market: "NSE",
    targetPosition,
    onProgress: (done, total) => {
      if (done % 25 === 0 || done === total) {
        process.stdout.write(`\r  fetched ${done}/${total}`);
      }
    },
  });
  console.log(`\n  done in ${((Date.now() - started) / 1000).toFixed(0)}s · ${failures.length} no-data\n`);

  // --- funnel -------------------------------------------------------------
  const inCapBand = rows.filter(
    (r) => r.market_cap_crores >= GATES.marketCapMinCrores && r.market_cap_crores <= GATES.marketCapMaxCrores
  );
  const growing = inCapBand.filter((r) => r.growth_rate >= GATES.growthMin);
  const quality = growing.filter((r) => r.roce >= GATES.roceMin);
  const cheap = quality.filter((r) => r.pe_ratio <= GATES.peMax);
  const scored = cheap
    .map((r) => ({ ...r, qs_score: scoreEmergingGrowth(r) }))
    .filter((r) => (r.qs_score ?? 0) >= GATES.minQs);
  const tradable = scored.filter((r) => r.liquidity.tradable);
  const traps = scored.filter((r) => !r.liquidity.tradable);

  const funnel: [string, number][] = [
    ["fetched with data", rows.length],
    [`market cap ₹${GATES.marketCapMinCrores}-${GATES.marketCapMaxCrores}cr`, inCapBand.length],
    [`revenue growth ≥ ${GATES.growthMin * 100}%`, growing.length],
    [`ROE (ROCE proxy) ≥ ${GATES.roceMin * 100}%`, quality.length],
    [`P/E ≤ ${GATES.peMax}`, cheap.length],
    [`QS score ≥ ${GATES.minQs}`, scored.length],
    ["passes liquidity screen", tradable.length],
  ];
  console.log("FUNNEL");
  funnel.forEach(([label, n]) => console.log(`  ${String(n).padStart(4)}  ${label}`));

  // --- results ------------------------------------------------------------
  const fmt = (r: SmallcapRow & { qs_score?: number }) =>
    [
      r.symbol.padEnd(12),
      `QS ${(r.qs_score ?? 0).toFixed(1)}`.padEnd(8),
      `₹${Math.round(r.price).toLocaleString()}`.padEnd(10),
      `${Math.round(r.market_cap_crores)}cr`.padEnd(9),
      `gr ${(r.growth_rate * 100).toFixed(0)}%`.padEnd(9),
      `roe ${(r.roce * 100).toFixed(0)}%`.padEnd(10),
      `pe ${r.pe_ratio.toFixed(1)}`.padEnd(10),
      `${r.liquidity.tier.padEnd(9)} ADV ${inr(r.liquidity.avgDailyTurnover)}`,
    ].join(" ");

  console.log(`\nPASSING (${tradable.length})`);
  if (!tradable.length) {
    console.log("  none — the gates are strict by design; see the funnel above for where names dropped.");
  } else {
    tradable
      .sort((a, b) => (b.qs_score ?? 0) - (a.qs_score ?? 0))
      .forEach((r) => console.log("  " + fmt(r)));
  }

  if (traps.length) {
    console.log(`\nGOOD ON PAPER, UNTRADABLE (${traps.length}) — this is the Trap Detector earning its keep`);
    traps.forEach((r) => {
      console.log("  " + fmt(r));
      console.log(`               ↳ ${r.liquidity.reason}`);
    });
  }

  console.log(
    `\nNotes: ROCE is proxied by ROE (Yahoo does not publish ROCE) — verify leverage on any name you act on.` +
      `\n       Not financial advice. Illustrative screen output, not a recommendation.\n`
  );
}

main().catch((err) => {
  console.error("scan failed:", err);
  process.exit(1);
});
