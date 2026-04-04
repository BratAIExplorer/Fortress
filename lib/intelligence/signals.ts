// Intelligence Layer — Signal Evaluation Rules
// Each macro signal is evaluated against thresholds to produce clarity text.
// No predictions. No advice. Only: what is happening and why it matters.

import type { SignalEvaluation, SignalLevel } from './types';

export interface MacroValues {
  crudeOilUsd: number | null;
  usdInr: number | null;
  cboeVix: number | null;
  indiaVix: number | null;
  us10yYield: number | null;
  goldUsd: number | null;
  nifty50: number | null;
  nifty50Prev: number | null;
  bankNifty: number | null;
  bankNiftyPrev: number | null;
}

function fmt(v: number | null, prefix = '', suffix = '', decimals = 2): string {
  if (v == null) return 'N/A';
  return `${prefix}${v.toLocaleString('en-US', { maximumFractionDigits: decimals })}${suffix}`;
}

function pctChange(current: number | null, prev: number | null): number | null {
  if (current == null || prev == null || prev === 0) return null;
  return ((current - prev) / prev) * 100;
}

// ─── Individual Signal Evaluators ────────────────────────────────────────────

function evalCrudeOil(value: number | null): SignalEvaluation {
  let level: SignalLevel;
  let headline: string;
  let explanation: string;

  if (value == null) {
    level = 'moderate';
    headline = 'Crude oil data unavailable';
    explanation = 'No oil price data in the current snapshot.';
  } else if (value < 60) {
    level = 'low';
    headline = 'Oil prices are low — input costs easing';
    explanation = 'Low oil reduces fuel and raw material costs for manufacturing, transport, and chemicals. Consumer-facing sectors tend to benefit from lower logistics costs. Energy producers face revenue pressure at these levels.';
  } else if (value < 80) {
    level = 'moderate';
    headline = 'Oil prices are at moderate levels';
    explanation = 'Oil at this range has a balanced impact. Manufacturing and transport costs remain manageable, and energy producers maintain reasonable margins. No significant macro pressure from crude at current levels.';
  } else if (value < 100) {
    level = 'elevated';
    headline = 'Elevated oil is raising input costs';
    explanation = 'Rising crude increases costs for energy-intensive sectors including manufacturing, chemicals, and logistics. Corporate margins may face compression, and inflation expectations tend to rise. Energy exploration companies typically benefit.';
  } else if (value < 120) {
    level = 'high';
    headline = 'High oil is significantly pressuring margins';
    explanation = 'At these levels, oil is a broad macro headwind. Manufacturing, transport, pharma (import-dependent raw materials), and FMCG all face margin pressure. Central banks may respond with tighter policy to control inflation. Renewable energy investment tends to accelerate.';
  } else {
    level = 'extreme';
    headline = 'Extreme oil prices signal supply disruption';
    explanation = 'Oil at these levels indicates a severe supply shock, often geopolitical in origin. Broad earnings pressure is expected across most sectors. Historical precedent suggests elevated recession risk if sustained. Energy and defence sectors are the primary beneficiaries.';
  }

  return {
    signal: 'crude_oil',
    label: 'Crude Oil',
    emoji: '🛢️',
    value,
    formattedValue: fmt(value, '$', '/bbl'),
    level,
    headline,
    explanation,
  };
}

function evalUsdInr(value: number | null): SignalEvaluation {
  let level: SignalLevel;
  let headline: string;
  let explanation: string;

  if (value == null) {
    level = 'moderate';
    headline = 'USD/INR data unavailable';
    explanation = 'No currency data in the current snapshot.';
  } else if (value < 82) {
    level = 'strong';
    headline = 'Rupee is relatively strong';
    explanation = 'A stronger rupee reduces import costs for energy, pharma raw materials, and electronics. Foreign currency debt servicing eases. IT exporters receive slightly less INR per dollar earned, though this is a mild effect.';
  } else if (value < 85) {
    level = 'moderate';
    headline = 'Rupee at moderate, stable levels';
    explanation = 'Currency at this range reflects equilibrium. Import costs are manageable and IT export earnings are not meaningfully distorted. No significant macro signal from currency at current levels.';
  } else if (value < 87) {
    level = 'weak';
    headline = 'Rupee is weakening — import costs rising';
    explanation = 'Rupee depreciation increases the cost of imported crude, pharma raw materials, and electronics components. IT exporters benefit as their USD revenues convert to more INR. Companies with foreign currency debt face higher repayment costs.';
  } else {
    level = 'very_weak';
    headline = 'Rupee under significant pressure';
    explanation = 'Sharp rupee depreciation signals potential capital outflows and raises import inflation risk. Energy import bills rise substantially, creating a feedback loop of inflation. RBI intervention is typically expected at these levels. IT and export-oriented sectors are relative safe havens.';
  }

  return {
    signal: 'usd_inr',
    label: 'USD / INR',
    emoji: '💱',
    value,
    formattedValue: fmt(value, '₹', '', 2),
    level,
    headline,
    explanation,
  };
}

function evalCboeVix(value: number | null): SignalEvaluation {
  let level: SignalLevel;
  let headline: string;
  let explanation: string;

  if (value == null) {
    level = 'moderate';
    headline = 'CBOE VIX data unavailable';
    explanation = 'No US volatility data in the current snapshot.';
  } else if (value < 15) {
    level = 'calm';
    headline = 'US markets are calm — low fear';
    explanation = 'A low VIX indicates stable near-term expectations in US markets. Global risk appetite is healthy, which typically supports FII inflows into emerging markets like India.';
  } else if (value < 20) {
    level = 'moderate';
    headline = 'Moderate US market uncertainty';
    explanation = 'Slightly elevated volatility indicates investors are pricing in some uncertainty. Risk-off positioning may modestly reduce emerging market inflows, but conditions remain broadly stable.';
  } else if (value < 30) {
    level = 'elevated';
    headline = 'US market fear is elevated';
    explanation = 'Rising VIX signals increasing investor anxiety in US markets. Historical data shows a correlation between elevated CBOE VIX and FII outflows from Indian equities. Defensive sectors tend to outperform during these periods.';
  } else {
    level = 'fearful';
    headline = 'US markets are in fear mode — high VIX';
    explanation = 'Extreme volatility in US markets typically triggers broad risk aversion globally. FII selling in emerging markets tends to accelerate above VIX 30. Liquidity conditions tighten and valuations compress across growth-oriented sectors.';
  }

  return {
    signal: 'cboe_vix',
    label: 'CBOE VIX',
    emoji: '📊',
    value,
    formattedValue: fmt(value, '', '', 1),
    level,
    headline,
    explanation,
  };
}

function evalIndiaVix(value: number | null): SignalEvaluation {
  let level: SignalLevel;
  let headline: string;
  let explanation: string;

  if (value == null) {
    level = 'moderate';
    headline = 'India VIX data unavailable';
    explanation = 'No India volatility data in the current snapshot.';
  } else if (value < 13) {
    level = 'calm';
    headline = 'India market volatility is low';
    explanation = 'Low India VIX suggests domestic investors expect near-term stability. Options markets are pricing in small moves, reflecting contained domestic risk.';
  } else if (value < 17) {
    level = 'moderate';
    headline = 'India volatility at moderate levels';
    explanation = 'India VIX is within a normal range. Markets are pricing in some uncertainty, but nothing indicative of acute stress. Short-term movements may be larger than usual.';
  } else if (value < 25) {
    level = 'elevated';
    headline = 'India market uncertainty is rising';
    explanation = 'Elevated India VIX indicates domestic investors are pricing in a wider range of outcomes. This is often accompanied by sharp intraday swings and choppy price action across indices.';
  } else {
    level = 'fearful';
    headline = 'High India VIX — significant domestic fear';
    explanation = 'India VIX at these levels reflects acute domestic uncertainty. Historically, India VIX above 25 has been associated with major market corrections, policy shocks, or significant geopolitical events affecting India directly.';
  }

  return {
    signal: 'india_vix',
    label: 'India VIX',
    emoji: '🔔',
    value,
    formattedValue: fmt(value, '', '', 1),
    level,
    headline,
    explanation,
  };
}

function evalUs10y(value: number | null): SignalEvaluation {
  let level: SignalLevel;
  let headline: string;
  let explanation: string;

  if (value == null) {
    level = 'moderate';
    headline = 'US 10Y yield data unavailable';
    explanation = 'No Treasury yield data in the current snapshot.';
  } else if (value < 3.5) {
    level = 'low';
    headline = 'US rates are low — global liquidity is ample';
    explanation = 'Low US Treasury yields make dollar assets less competitive, encouraging global capital to seek higher returns in emerging markets. This typically supports FII inflows into India.';
  } else if (value < 4.5) {
    level = 'moderate';
    headline = 'US rates at moderate levels';
    explanation = 'Treasury yields at this level have a balanced impact. Emerging market inflows remain possible, though investors weigh India\'s yield differential carefully. No acute pressure from US rates at this level.';
  } else if (value < 5.5) {
    level = 'high';
    headline = 'High US rates — competing for global capital';
    explanation = 'Elevated Treasury yields make US bonds increasingly attractive relative to emerging market equities. FII inflows into India tend to slow, and the rupee may face depreciation pressure. Growth-oriented sectors face higher discount rates.';
  } else {
    level = 'very_high';
    headline = 'US rates are very high — significant headwind';
    explanation = 'Rates at these levels signal aggressive Fed policy or structural inflation concerns. Global capital typically retreats toward dollar assets, creating sustained FII outflow pressure on India. Historical precedent associates these levels with emerging market stress.';
  }

  return {
    signal: 'us_10y',
    label: 'US 10Y Yield',
    emoji: '🏛️',
    value,
    formattedValue: fmt(value, '', '%', 2),
    level,
    headline,
    explanation,
  };
}

function evalGold(value: number | null): SignalEvaluation {
  let level: SignalLevel;
  let headline: string;
  let explanation: string;

  if (value == null) {
    level = 'moderate';
    headline = 'Gold data unavailable';
    explanation = 'No gold price data in the current snapshot.';
  } else if (value < 1800) {
    level = 'low';
    headline = 'Gold is subdued — risk appetite is healthy';
    explanation = 'Low gold prices typically indicate investors are confident and allocating to risk assets rather than safe havens. This generally correlates with positive equity market sentiment.';
  } else if (value < 2200) {
    level = 'moderate';
    headline = 'Gold at normal levels';
    explanation = 'Gold at this range reflects balanced risk sentiment. Neither strong risk aversion nor exuberant risk appetite is signalled. Domestic gold demand (India) adds a seasonal component independent of global fear.';
  } else if (value < 2800) {
    level = 'elevated';
    headline = 'Elevated gold — safe-haven demand rising';
    explanation = 'Rising gold indicates investors are seeking safety. This often precedes or accompanies broader market caution. Central banks are also active gold buyers at these levels, suggesting structural demand beyond just fear.';
  } else {
    level = 'high';
    headline = 'Gold at high levels — broad risk aversion';
    explanation = 'Gold at these levels signals significant investor anxiety, often linked to inflation fears, currency debasement concerns, or geopolitical instability. Historically, gold at these levels has been accompanied by equity market volatility.';
  }

  return {
    signal: 'gold',
    label: 'Gold',
    emoji: '🥇',
    value,
    formattedValue: fmt(value, '$', '/oz', 0),
    level,
    headline,
    explanation,
  };
}

function evalNifty50(value: number | null, prev: number | null): SignalEvaluation {
  const chg = pctChange(value, prev);
  let level: SignalLevel;
  let headline: string;
  let explanation: string;

  if (value == null) {
    level = 'flat';
    headline = 'Nifty 50 data unavailable';
    explanation = 'No index data in the current snapshot.';
  } else if (chg == null) {
    level = 'flat';
    headline = 'Nifty 50 — no prior data to compare';
    explanation = 'Current Nifty 50 level is recorded. Week-over-week change will appear once a prior snapshot exists.';
  } else if (chg > 2) {
    level = 'bullish';
    headline = `Nifty 50 rising — up ${chg.toFixed(1)}% from last week`;
    explanation = 'Indian large-cap equities gained ground this week. Broad market strength suggests positive domestic sentiment, though the macro environment should still be considered for sector-level positions.';
  } else if (chg < -2) {
    level = 'bearish';
    headline = `Nifty 50 declining — down ${Math.abs(chg).toFixed(1)}% from last week`;
    explanation = 'Indian large-cap equities lost ground this week. Market-wide selling can reflect macro headwinds, FII outflows, or domestic sentiment shifts. Individual sector moves may diverge significantly from the index.';
  } else {
    level = 'flat';
    headline = 'Nifty 50 is broadly flat this week';
    explanation = 'The headline index moved within a narrow range, suggesting consolidation. Sector rotation may be occurring beneath the surface even when the index appears stable.';
  }

  return {
    signal: 'nifty50',
    label: 'Nifty 50',
    emoji: '🇮🇳',
    value,
    formattedValue: fmt(value, '', '', 0),
    level,
    headline,
    explanation,
  };
}

function evalBankNifty(value: number | null, prev: number | null): SignalEvaluation {
  const chg = pctChange(value, prev);
  let level: SignalLevel;
  let headline: string;
  let explanation: string;

  if (value == null) {
    level = 'flat';
    headline = 'Bank Nifty data unavailable';
    explanation = 'No banking index data in the current snapshot.';
  } else if (chg == null) {
    level = 'flat';
    headline = 'Bank Nifty — no prior data to compare';
    explanation = 'Current Bank Nifty level is recorded. Week-over-week change will appear once a prior snapshot exists.';
  } else if (chg > 2) {
    level = 'bullish';
    headline = `Banking sector rising — up ${chg.toFixed(1)}%`;
    explanation = 'Indian banking stocks outperformed this week, signalling positive credit conditions or rate expectations. A strong Bank Nifty often leads broader market recovery.';
  } else if (chg < -3) {
    level = 'bearish';
    headline = `Banking sector under pressure — down ${Math.abs(chg).toFixed(1)}%`;
    explanation = 'Banking stocks are declining, which may reflect concerns about credit quality, rate sensitivity, or FII selling in financial stocks. Banks are the largest weight in Nifty 50 — weakness here amplifies index impact.';
  } else {
    level = 'flat';
    headline = 'Banking sector is consolidating';
    explanation = 'Bank Nifty is moving within a tight range, suggesting the sector is awaiting a clearer direction from rate policy or credit data.';
  }

  return {
    signal: 'bank_nifty',
    label: 'Bank Nifty',
    emoji: '🏦',
    value,
    formattedValue: fmt(value, '', '', 0),
    level,
    headline,
    explanation,
  };
}

// ─── Main Evaluator ───────────────────────────────────────────────────────────

export function evaluateSignals(values: MacroValues): SignalEvaluation[] {
  return [
    evalNifty50(values.nifty50, values.nifty50Prev),
    evalBankNifty(values.bankNifty, values.bankNiftyPrev),
    evalCrudeOil(values.crudeOilUsd),
    evalUsdInr(values.usdInr),
    evalCboeVix(values.cboeVix),
    evalIndiaVix(values.indiaVix),
    evalUs10y(values.us10yYield),
    evalGold(values.goldUsd),
  ];
}
