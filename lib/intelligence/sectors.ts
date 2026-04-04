// Intelligence Layer — Sector Impact Mapper
// Maps evaluated macro signals to sector-level clarity.
// No advice. No predictions. Only: what each sector faces given current conditions.

import type { SignalEvaluation, SectorImpact, ImpactDirection, ImpactStrength } from './types';

interface SectorRule {
  sector: string;
  emoji: string;
  market: 'India' | 'US' | 'Global';
  evaluate: (signals: Map<string, SignalEvaluation>) => Pick<SectorImpact, 'impact' | 'strength' | 'clarityText'>;
}

function get(signals: Map<string, SignalEvaluation>, key: string): SignalEvaluation | undefined {
  return signals.get(key);
}

function level(signals: Map<string, SignalEvaluation>, key: string): string {
  return signals.get(key)?.level ?? 'moderate';
}

// ─── Sector Rules ─────────────────────────────────────────────────────────────

const SECTOR_RULES: SectorRule[] = [
  {
    sector: 'Energy & Oil (India)',
    emoji: '⚡',
    market: 'India',
    evaluate(signals) {
      const oil = level(signals, 'crude_oil');
      if (['high', 'extreme'].includes(oil)) {
        return { impact: 'positive', strength: 'strong', clarityText: 'High oil prices directly boost revenue for Indian energy explorers (ONGC, Oil India). Upstream benefits outweigh downstream margin pressure at these levels.' };
      }
      if (oil === 'elevated') {
        return { impact: 'positive', strength: 'moderate', clarityText: 'Elevated oil supports upstream energy revenues. Refining margins are mixed — downstream companies pass some costs to consumers.' };
      }
      return { impact: 'negative', strength: 'moderate', clarityText: 'Lower oil moderates revenue for Indian energy producers. Refining companies benefit from cheaper crude inputs.' };
    },
  },
  {
    sector: 'IT & Technology (India)',
    emoji: '💻',
    market: 'India',
    evaluate(signals) {
      const inr = level(signals, 'usd_inr');
      const cboe = level(signals, 'cboe_vix');
      const oilLevel = level(signals, 'crude_oil');
      const isRupeeWeak = ['weak', 'very_weak'].includes(inr);
      const isVixHigh = ['elevated', 'fearful'].includes(cboe);
      const isOilHigh = ['high', 'extreme'].includes(oilLevel);

      if (isRupeeWeak && !isVixHigh) {
        return { impact: 'positive', strength: 'moderate', clarityText: 'Rupee weakness boosts INR realisation on dollar-denominated IT revenues. IT is one of the few sectors that benefits directly from currency depreciation.' };
      }
      if (isRupeeWeak && isVixHigh) {
        return { impact: 'mixed', strength: 'moderate', clarityText: 'Rupee weakness helps IT earnings in INR terms, but high global volatility risks client spending caution — especially in discretionary tech projects.' };
      }
      if (isOilHigh && !isVixHigh) {
        return { impact: 'neutral', strength: 'mild', clarityText: 'IT is relatively insulated from oil price moves. Energy costs for data centres are a minor input cost. No significant direct impact at current levels.' };
      }
      return { impact: 'neutral', strength: 'mild', clarityText: 'IT sector shows relative resilience in the current environment. Dollar earnings provide a natural hedge against domestic macro pressures.' };
    },
  },
  {
    sector: 'Banking & Finance (India)',
    emoji: '🏦',
    market: 'India',
    evaluate(signals) {
      const us10y = level(signals, 'us_10y');
      const vix = level(signals, 'cboe_vix');
      const bankNifty = level(signals, 'bank_nifty');
      const isRatesHigh = ['high', 'very_high'].includes(us10y);
      const isVixHigh = ['elevated', 'fearful'].includes(vix);
      const isBankNiftyDown = bankNifty === 'bearish';

      if (isRatesHigh && isVixHigh) {
        return { impact: 'negative', strength: 'strong', clarityText: 'Banking sector faces a double headwind: high US rates attract global capital away from Indian banks, while elevated volatility raises credit risk perception and compresses valuations.' };
      }
      if (isRatesHigh || isBankNiftyDown) {
        return { impact: 'negative', strength: 'moderate', clarityText: 'Rate-sensitive banking sector faces pressure from high global yields competing for capital. Net interest margins may compress if deposit costs rise faster than lending rates.' };
      }
      return { impact: 'neutral', strength: 'mild', clarityText: 'Banking sector is navigating a mixed macro environment. Domestic credit growth and RBI policy direction remain the primary drivers to watch.' };
    },
  },
  {
    sector: 'Manufacturing & Chemicals',
    emoji: '🏭',
    market: 'India',
    evaluate(signals) {
      const oil = level(signals, 'crude_oil');
      const inr = level(signals, 'usd_inr');
      const isOilHigh = ['elevated', 'high', 'extreme'].includes(oil);
      const isRupeeWeak = ['weak', 'very_weak'].includes(inr);

      if (isOilHigh && isRupeeWeak) {
        return { impact: 'negative', strength: 'strong', clarityText: 'Manufacturing faces a two-sided squeeze: high oil raises energy and feedstock costs, while a weaker rupee inflates import bills for raw materials priced in dollars.' };
      }
      if (isOilHigh) {
        return { impact: 'negative', strength: 'moderate', clarityText: 'Elevated oil increases energy and petrochemical input costs for manufacturers. Margin pressure is likely unless companies can pass costs to end customers.' };
      }
      return { impact: 'positive', strength: 'moderate', clarityText: 'Lower oil and stable currency provide a favourable input cost environment for manufacturers. Margin expansion is possible if demand holds up.' };
    },
  },
  {
    sector: 'Pharma & Healthcare',
    emoji: '💊',
    market: 'India',
    evaluate(signals) {
      const inr = level(signals, 'usd_inr');
      const oil = level(signals, 'crude_oil');
      const isRupeeWeak = ['weak', 'very_weak'].includes(inr);
      const isOilHigh = ['elevated', 'high', 'extreme'].includes(oil);

      if (isRupeeWeak && !isOilHigh) {
        return { impact: 'positive', strength: 'moderate', clarityText: 'Pharma exporters benefit from rupee weakness — dollar-denominated generic drug revenues convert to more INR. API imports remain a cost to watch.' };
      }
      if (isRupeeWeak && isOilHigh) {
        return { impact: 'mixed', strength: 'moderate', clarityText: 'Pharma faces competing forces: export revenue benefits from rupee weakness, but high oil raises logistics and petrochemical input costs. Net impact varies by company mix.' };
      }
      return { impact: 'neutral', strength: 'mild', clarityText: 'Pharma sector faces a balanced macro environment. Domestic-focused companies are relatively insulated; exporters track rupee movements closely.' };
    },
  },
  {
    sector: 'Defence & Aerospace',
    emoji: '🛡️',
    market: 'India',
    evaluate(signals) {
      const vix = level(signals, 'cboe_vix');
      const oil = level(signals, 'crude_oil');
      const isHighRisk = ['elevated', 'fearful'].includes(vix) || ['high', 'extreme'].includes(oil);

      if (isHighRisk) {
        return { impact: 'positive', strength: 'moderate', clarityText: 'Geopolitical tension and market stress historically increase government defence budget allocation. Indian defence manufacturers and aerospace companies tend to be relatively resilient in risk-off environments.' };
      }
      return { impact: 'neutral', strength: 'mild', clarityText: 'Defence sector is driven by long-term government capex cycles rather than short-term macro signals. Order books and policy news matter more than weekly macro shifts.' };
    },
  },
  {
    sector: 'Renewables & Green Energy',
    emoji: '☀️',
    market: 'India',
    evaluate(signals) {
      const oil = level(signals, 'crude_oil');
      const us10y = level(signals, 'us_10y');
      const isOilHigh = ['elevated', 'high', 'extreme'].includes(oil);
      const isRatesHigh = ['high', 'very_high'].includes(us10y);

      if (isOilHigh && !isRatesHigh) {
        return { impact: 'positive', strength: 'strong', clarityText: 'High fossil fuel prices dramatically improve the economics of solar, wind, and green hydrogen. Policy urgency around energy security accelerates government capex into renewables.' };
      }
      if (isOilHigh && isRatesHigh) {
        return { impact: 'mixed', strength: 'moderate', clarityText: 'High oil strengthens the long-term case for renewables, but high interest rates raise the financing cost of capital-intensive clean energy projects. Near-term project economics are compressed.' };
      }
      return { impact: 'neutral', strength: 'mild', clarityText: 'Renewables sector is driven by policy and long-term energy transition dynamics. Short-term macro signals have limited impact on fundamentally secular growth drivers.' };
    },
  },
  {
    sector: 'FMCG & Consumer',
    emoji: '🛒',
    market: 'India',
    evaluate(signals) {
      const oil = level(signals, 'crude_oil');
      const nifty = level(signals, 'nifty50');
      const isOilHigh = ['elevated', 'high', 'extreme'].includes(oil);
      const isMarketDown = nifty === 'bearish';

      if (isOilHigh && isMarketDown) {
        return { impact: 'negative', strength: 'moderate', clarityText: 'FMCG faces rising input costs from oil (packaging, logistics) while consumer sentiment softens in a declining market. Volume growth may decelerate as inflation erodes purchasing power.' };
      }
      if (isOilHigh) {
        return { impact: 'negative', strength: 'mild', clarityText: 'Higher oil inflates packaging and logistics costs for FMCG companies. Large FMCG players can partially offset with pricing power; smaller brands face more margin pressure.' };
      }
      return { impact: 'positive', strength: 'mild', clarityText: 'Stable to low input costs support FMCG margins. Consumer staples tend to be defensive — demand is relatively inelastic regardless of market conditions.' };
    },
  },
  // ─── US Sectors ──────────────────────────────────────────────────────────────
  {
    sector: 'US Technology',
    emoji: '🖥️',
    market: 'US',
    evaluate(signals) {
      const us10y = level(signals, 'us_10y');
      const vix = level(signals, 'cboe_vix');
      const isRatesHigh = ['high', 'very_high'].includes(us10y);
      const isVixHigh = ['elevated', 'fearful'].includes(vix);

      if (isRatesHigh && isVixHigh) {
        return { impact: 'negative', strength: 'strong', clarityText: 'US tech faces a double pressure: high rates compress growth stock valuations (future earnings worth less today), while elevated volatility reduces risk appetite for high-multiple names.' };
      }
      if (isRatesHigh) {
        return { impact: 'negative', strength: 'moderate', clarityText: 'High US rates structurally compress valuations for growth and tech stocks. The discount rate applied to future earnings rises, reducing fair value estimates for high-growth companies.' };
      }
      return { impact: 'neutral', strength: 'mild', clarityText: 'US tech is in a moderate macro environment. Revenue growth quality and AI spending trends are the primary drivers at current rate levels.' };
    },
  },
  {
    sector: 'US Energy',
    emoji: '🔋',
    market: 'US',
    evaluate(signals) {
      const oil = level(signals, 'crude_oil');
      if (['high', 'extreme'].includes(oil)) {
        return { impact: 'positive', strength: 'strong', clarityText: 'High oil is a direct revenue tailwind for US energy producers (Exxon, Chevron, Pioneer). Upstream profits and free cash flow expand materially at these levels.' };
      }
      if (oil === 'elevated') {
        return { impact: 'positive', strength: 'moderate', clarityText: 'Elevated oil supports US energy sector earnings. Shale producers in particular maintain healthy margins above $70-80/bbl breakevens.' };
      }
      return { impact: 'negative', strength: 'moderate', clarityText: 'Lower oil reduces revenue and margins for US energy producers. Companies with higher production costs face disproportionate earnings pressure.' };
    },
  },
  {
    sector: 'US Financials',
    emoji: '🏛️',
    market: 'US',
    evaluate(signals) {
      const us10y = level(signals, 'us_10y');
      const vix = level(signals, 'cboe_vix');
      const isRatesHigh = ['high', 'very_high'].includes(us10y);
      const isVixHigh = ['elevated', 'fearful'].includes(vix);

      if (isRatesHigh && !isVixHigh) {
        return { impact: 'mixed', strength: 'moderate', clarityText: 'High rates widen net interest margins for US banks (positive for lending profit) but raise credit risk if the economy slows. Large banks benefit; regional banks with fixed-rate mortgage books face pressure.' };
      }
      if (isVixHigh) {
        return { impact: 'negative', strength: 'moderate', clarityText: 'Elevated market volatility raises credit default concerns and reduces M&A/IPO activity, which pressures investment banking revenue. Trading revenues may benefit from volatility.' };
      }
      return { impact: 'neutral', strength: 'mild', clarityText: 'US financials are in a balanced macro environment. Loan growth and credit quality are the key internal drivers to watch.' };
    },
  },
];

// ─── Main Mapper ──────────────────────────────────────────────────────────────

export function mapSectorImpacts(signals: SignalEvaluation[]): SectorImpact[] {
  const signalMap = new Map(signals.map(s => [s.signal, s]));

  return SECTOR_RULES.map(rule => {
    const { impact, strength, clarityText } = rule.evaluate(signalMap);
    return {
      sector: rule.sector,
      emoji: rule.emoji,
      market: rule.market,
      impact,
      strength,
      clarityText,
    };
  });
}
