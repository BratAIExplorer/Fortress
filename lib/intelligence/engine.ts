// Intelligence Layer — Orchestrator
// Reads latest macro snapshot, runs signal evaluation + sector mapping,
// builds the environment summary, and returns a structured IntelligenceReport.

import type { IntelligenceReport, EnvironmentFactor } from './types';
import { evaluateSignals, type MacroValues } from './signals';
import { mapSectorImpacts } from './sectors';

interface MacroSnapshotRow {
  id: string;
  snapshotDate: string;
  nifty50: string | null;
  bankNifty: string | null;
  usdInr: string | null;
  goldUsd: string | null;
  crudeOilUsd: string | null;
  us10yYield: string | null;
  cboeVix: string | null;
  indiaVix: string | null;
}

function parse(s: string | null): number | null {
  if (s == null) return null;
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function buildEnvironment(values: MacroValues): EnvironmentFactor[] {
  const oilVal = values.crudeOilUsd;
  const vixVal = values.cboeVix;
  const indiaVixVal = values.indiaVix;
  const us10y = values.us10yYield;

  // Demand signal — proxied by PMI-adjacent indicators (oil demand + market trend)
  const niftyPct = values.nifty50 && values.nifty50Prev
    ? ((values.nifty50 - values.nifty50Prev) / values.nifty50Prev) * 100
    : null;
  const demandNegative = (oilVal != null && oilVal > 100) || (niftyPct != null && niftyPct < -3);
  const demandPositive = niftyPct != null && niftyPct > 2 && (oilVal == null || oilVal < 85);

  const demand: EnvironmentFactor = demandNegative
    ? { label: 'Demand', state: 'Weakening', level: 'negative', note: 'High oil and falling markets signal demand-side stress.' }
    : demandPositive
    ? { label: 'Demand', state: 'Strengthening', level: 'positive', note: 'Rising markets and moderate oil suggest healthy demand conditions.' }
    : { label: 'Demand', state: 'Stable', level: 'neutral', note: 'Demand signals are mixed or inconclusive at current levels.' };

  // Liquidity signal — US10Y + CBOE VIX proxy for global liquidity
  const liquidityTight = (us10y != null && us10y > 4.5) || (vixVal != null && vixVal > 25);
  const liquidityLoose = us10y != null && us10y < 3.5 && (vixVal == null || vixVal < 18);

  const liquidity: EnvironmentFactor = liquidityTight
    ? { label: 'Liquidity', state: 'Outflow', level: 'negative', note: 'High US rates and elevated VIX signal risk-off capital outflows from emerging markets.' }
    : liquidityLoose
    ? { label: 'Liquidity', state: 'Inflow', level: 'positive', note: 'Low rates and calm markets support capital inflows into India and emerging markets.' }
    : { label: 'Liquidity', state: 'Neutral', level: 'neutral', note: 'Liquidity conditions are balanced — neither significant inflow nor outflow pressure.' };

  // Cost pressure — oil-driven
  const costHigh = oilVal != null && oilVal > 90;
  const costLow = oilVal != null && oilVal < 70;

  const costPressure: EnvironmentFactor = costHigh
    ? { label: 'Cost Pressure', state: 'Rising', level: 'negative', note: 'High crude oil is pushing up input costs across manufacturing, logistics, and energy-intensive sectors.' }
    : costLow
    ? { label: 'Cost Pressure', state: 'Falling', level: 'positive', note: 'Lower oil is easing input cost pressure across most industrial sectors.' }
    : { label: 'Cost Pressure', state: 'Stable', level: 'neutral', note: 'Input cost environment is moderate — no acute pressure from commodity prices.' };

  // Geopolitical risk — VIX + oil combination
  const geoHigh = (vixVal != null && vixVal > 22) || (oilVal != null && oilVal > 100) || (indiaVixVal != null && indiaVixVal > 20);
  const geoLow = (vixVal == null || vixVal < 16) && (oilVal == null || oilVal < 80);

  const geopolitical: EnvironmentFactor = geoHigh
    ? { label: 'Geopolitical Risk', state: 'Elevated', level: 'negative', note: 'High VIX and oil signal market-perceived geopolitical or systemic risk. Defensive sectors historically outperform.' }
    : geoLow
    ? { label: 'Geopolitical Risk', state: 'Low', level: 'positive', note: 'Calm markets and moderate commodity prices suggest limited geopolitical risk being priced in.' }
    : { label: 'Geopolitical Risk', state: 'Moderate', level: 'neutral', note: 'Some geopolitical risk is present but markets are not in acute stress mode.' };

  return [demand, liquidity, costPressure, geopolitical];
}

function buildSummary(
  environment: EnvironmentFactor[],
  values: MacroValues
): string {
  const negativeCount = environment.filter(e => e.level === 'negative').length;
  const positiveCount = environment.filter(e => e.level === 'positive').length;

  const oilContext = values.crudeOilUsd != null
    ? values.crudeOilUsd > 100
      ? 'Crude oil above $100 is the dominant macro pressure, raising input costs broadly.'
      : values.crudeOilUsd < 70
      ? 'Low oil is a positive input cost signal for most sectors.'
      : 'Oil is at moderate levels with a balanced sectoral impact.'
    : 'Oil price data is unavailable in this snapshot.';

  const marketMood = negativeCount >= 3
    ? 'The overall macro environment shows multiple stress signals. Defensive positioning and earnings quality are especially relevant to review.'
    : negativeCount === 2
    ? 'Two of four macro environment factors are under pressure. Mixed conditions favour sector-specific analysis over broad market calls.'
    : positiveCount >= 3
    ? 'The macro environment shows broadly supportive conditions. Risk appetite and sector rotation opportunities are worth monitoring.'
    : 'The macro environment is broadly balanced, with sector-specific signals more meaningful than aggregate direction.';

  const itNote = ['weak', 'very_weak'].includes(
    environment.find(e => e.label === 'Liquidity')?.state?.toLowerCase() ?? ''
  )
    ? ' IT and export-oriented sectors show relative resilience in the current currency environment.'
    : '';

  return `${oilContext} ${marketMood}${itNote}`;
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function buildIntelligenceReport(
  current: MacroSnapshotRow,
  previous: MacroSnapshotRow | null
): IntelligenceReport {
  const values: MacroValues = {
    crudeOilUsd: parse(current.crudeOilUsd),
    usdInr: parse(current.usdInr),
    cboeVix: parse(current.cboeVix),
    indiaVix: parse(current.indiaVix),
    us10yYield: parse(current.us10yYield),
    goldUsd: parse(current.goldUsd),
    nifty50: parse(current.nifty50),
    nifty50Prev: previous ? parse(previous.nifty50) : null,
    bankNifty: parse(current.bankNifty),
    bankNiftyPrev: previous ? parse(previous.bankNifty) : null,
  };

  const signals = evaluateSignals(values);
  const sectorImpacts = mapSectorImpacts(signals);
  const environment = buildEnvironment(values);
  const summary = buildSummary(environment, values);

  return {
    id: current.id,
    snapshotDate: current.snapshotDate,
    generatedAt: new Date().toISOString(),
    signals,
    sectorImpacts,
    environment,
    summary,
  };
}
