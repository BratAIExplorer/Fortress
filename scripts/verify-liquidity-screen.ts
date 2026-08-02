/**
 * Offline verification for the liquidity screen (Trap Detector).
 * No network, no test framework needed.
 *   npx -y tsx scripts/verify-liquidity-screen.ts
 */
import { screenLiquidity, type Bar } from "../lib/scanners/liquidity-screen";
const bars = (turnover: number, n = 20): Bar[] =>
  Array.from({ length: n }, () => ({ close: 100, volume: turnover / 100 }));
let pass = 0, fail = 0;
const t = (name: string, cond: boolean) => { cond ? pass++ : fail++; console.log((cond ? "PASS " : "FAIL ") + name); };

t("liquid: 10cr/day -> LIQUID",  screenLiquidity(bars(100_000_000)).tier === "LIQUID");
t("tradable: 2cr/day -> TRADABLE", screenLiquidity(bars(20_000_000)).tier === "TRADABLE");
t("thin: 50L/day -> THIN",        screenLiquidity(bars(5_000_000)).tier === "THIN");
t("trap: 10L/day -> TRAP",        screenLiquidity(bars(1_000_000)).tier === "TRAP");
t("trap is not tradable",        screenLiquidity(bars(1_000_000)).tradable === false);

const gappy = bars(20_000_000); [0,1,2,3].forEach(i => (gappy[i].volume = 0));
t("4 zero-volume days -> TRAP",  screenLiquidity(gappy).tier === "TRAP");

const ok2 = bars(20_000_000); ok2[0].volume = 0;
t("1 zero-volume day survives",  screenLiquidity(ok2).tier === "TRADABLE");
t("short history -> TRAP",       screenLiquidity(bars(100_000_000, 8)).tier === "TRAP");

const big = screenLiquidity(bars(20_000_000), 5_000_000); // 25% of daily turnover
t("oversized position flagged",  big.tier === "THIN" && big.participationPct === 25);
t("maxSafePosition = 10% ADV",   screenLiquidity(bars(20_000_000)).maxSafePosition === 2_000_000);
const small = screenLiquidity(bars(20_000_000), 500_000); // 2.5%
t("right-sized position ok",     small.tier === "TRADABLE");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
