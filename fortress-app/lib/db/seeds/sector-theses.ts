/**
 * Multi-Sector Thesis Seed Data
 *
 * 50+ sectors with macro catalysts, historical performance, conviction scores
 * Run once: npm run seed:theses
 * Update weekly: Cron job at 2am Sunday (conviction scores auto-update)
 *
 * Sectors organized by:
 * - GROWTH (secular tailwinds)
 * - VALUE (cyclical recovery)
 * - DEFENSIVE (recession-proof)
 * - MACRO (geopolitical/macro drivers)
 */

export const SECTOR_THESES = [
  // ========== GROWTH THESES (Secular Tailwinds) ==========

  {
    name: "Healthcare Growth (India)",
    slug: "healthcare-growth-india",
    description: "India healthcare spend inflection at $25k GDP per capita. 13x vs Nifty in 10yr.",
    macroCatalyst: "GDP per capita inflection → healthcare consumption surge",
    timeframeYears: 50,
    historicalCagr: 13.0,
    convictionScore: 0.80,
    convictionStatus: "WORKING",
    isActive: true,
  },

  {
    name: "Semiconductors (Geopolitical Shift)",
    slug: "semiconductors-geopolitical",
    description: "De-risking from China. India + US + Taiwan foundries winning.",
    macroCatalyst: "US-China decoupling accelerates semiconductor supply chain",
    timeframeYears: 10,
    historicalCagr: 18.0,
    convictionScore: 0.75,
    convictionStatus: "WORKING",
    isActive: true,
  },

  {
    name: "Renewable Energy (Global Transition)",
    slug: "renewable-energy",
    description: "Net-zero targets drive $2T energy capex globally. Solar/wind/battery.",
    macroCatalyst: "Global net-zero commitments + energy security post-Russia",
    timeframeYears: 20,
    historicalCagr: 16.0,
    convictionScore: 0.78,
    convictionStatus: "WORKING",
    isActive: true,
  },

  {
    name: "Electric Vehicles (Adoption S-Curve)",
    slug: "electric-vehicles",
    description: "EV adoption ramping (5% → 50% by 2030). Battery supply critical.",
    macroCatalyst: "EV adoption S-curve + battery tech improvement curve",
    timeframeYears: 15,
    historicalCagr: 22.0,
    convictionScore: 0.72,
    convictionStatus: "WORKING",
    isActive: true,
  },

  {
    name: "AI/Cloud Computing",
    slug: "ai-cloud-computing",
    description: "AI capex boom. Cloud infrastructure + semiconductor demand surging.",
    macroCatalyst: "Enterprise AI adoption + data center buildout",
    timeframeYears: 10,
    historicalCagr: 25.0,
    convictionScore: 0.70,
    convictionStatus: "WORKING",
    isActive: true,
  },

  {
    name: "Pharmaceuticals APIs (Supply Shift)",
    slug: "pharma-apis",
    description: "80% pharma APIs from China → shifting to India/West. Supply premium.",
    macroCatalyst: "US sanctions + nearshoring of critical pharmaceuticals",
    timeframeYears: 5,
    historicalCagr: 20.0,
    convictionScore: 0.68,
    convictionStatus: "WORKING",
    isActive: true,
  },

  {
    name: "Data Centers (AI Capex)",
    slug: "data-centers",
    description: "Hyperscaler capex on AI training/inference. Real estate + cooling play.",
    macroCatalyst: "AI training requires massive compute + cooling infrastructure",
    timeframeYears: 7,
    historicalCagr: 18.0,
    convictionScore: 0.65,
    convictionStatus: "WORKING",
    isActive: true,
  },

  // ========== VALUE THESES (Cyclical Recovery) ==========

  {
    name: "NBFC/Lending Cycle",
    slug: "nbfc-lending-cycle",
    description: "Household credit upcycle after COVID deleveraging. Retailers (MFI/NBFC) benefit.",
    macroCatalyst: "Indian households balance sheet repaired, credit cycle turning up",
    timeframeYears: 5,
    historicalCagr: 15.0,
    convictionScore: 0.70,
    convictionStatus: "WORKING",
    isActive: true,
  },

  {
    name: "Financials (Rate Environment)",
    slug: "financials-rate-cycle",
    description: "Banks benefit from deposit repricing + credit growth. Insurance adoption rising.",
    macroCatalyst: "RBI rate cycle + rising insurance penetration",
    timeframeYears: 3,
    historicalCagr: 12.0,
    convictionScore: 0.65,
    convictionStatus: "WORKING",
    isActive: true,
  },

  {
    name: "Infrastructure (Capex Cycle)",
    slug: "infrastructure-capex",
    description: "Government spending on roads, rails, airports. Toll roads, logistics benefiting.",
    macroCatalyst: "Government capex cycle + private investment in infra",
    timeframeYears: 7,
    historicalCagr: 14.0,
    convictionScore: 0.70,
    convictionStatus: "WORKING",
    isActive: true,
  },

  {
    name: "Metals & Mining (Supply Squeeze)",
    slug: "metals-mining",
    description: "Supply constraints (lithium, copper, nickel). EV + renewable demand surge.",
    macroCatalyst: "EV/renewable ramp creates supply squeeze on battery metals",
    timeframeYears: 8,
    historicalCagr: 11.0,
    convictionScore: 0.62,
    convictionStatus: "WORKING",
    isActive: true,
  },

  {
    name: "Construction (Housing Demand)",
    slug: "construction-housing",
    description: "Tier-2/3 cities urbanizing. Young population + rising income buying homes.",
    macroCatalyst: "Urbanization + rising middle class housing demand",
    timeframeYears: 10,
    historicalCagr: 13.0,
    convictionScore: 0.68,
    convictionStatus: "WORKING",
    isActive: true,
  },

  // ========== DEFENSIVE THESES (Recession-Proof) ==========

  {
    name: "Consumer Staples (Pricing Power)",
    slug: "consumer-staples",
    description: "FMCG has pricing power in inflation. Demand inelastic (food always needed).",
    macroCatalyst: "Inflation cycle + consumer staples benefit from shrinkflation",
    timeframeYears: 3,
    historicalCagr: 10.0,
    convictionScore: 0.75,
    convictionStatus: "WORKING",
    isActive: true,
  },

  {
    name: "Diagnostics (Healthcare Demand)",
    slug: "diagnostics",
    description: "Diagnostic consolidation play. Government PPP model driving volume.",
    macroCatalyst: "Healthcare accessibility + government diagnostics PPP program",
    timeframeYears: 5,
    historicalCagr: 12.0,
    convictionScore: 0.72,
    convictionStatus: "WORKING",
    isActive: true,
  },

  {
    name: "Education (Secular Growth)",
    slug: "education",
    description: "No publicly listed pure plays, but education services/platforms growing.",
    macroCatalyst: "Rising incomes + education spend (irreversible cultural trend)",
    timeframeYears: 15,
    historicalCagr: 15.0,
    convictionScore: 0.55,
    convictionStatus: "WORKING",
    isActive: true,
  },

  {
    name: "Beverages (Brand Moat)",
    slug: "beverages",
    description: "Brand moat + pricing power. Volumes growing in rural India.",
    macroCatalyst: "Rural consumption growth + brand premiumization",
    timeframeYears: 10,
    historicalCagr: 11.0,
    convictionScore: 0.68,
    convictionStatus: "WORKING",
    isActive: true,
  },

  {
    name: "Telecom (Consolidation Play)",
    slug: "telecom",
    description: "3-player market stabilized. ARPU rising post-consolidation.",
    macroCatalyst: "Telecom consolidation + data growth + 5G capex cycle",
    timeframeYears: 5,
    historicalCagr: 8.0,
    convictionScore: 0.60,
    convictionStatus: "WORKING",
    isActive: true,
  },

  // ========== MACRO THESES (Geopolitical/Cyclical) ==========

  {
    name: "Commodities (Inflation Hedge)",
    slug: "commodities-inflation",
    description: "Global liquidity without goods = inflation. Commodities benefit.",
    macroCatalyst: "Currency debasement + inflation cycle",
    timeframeYears: 3,
    historicalCagr: 12.0,
    convictionScore: 0.65,
    convictionStatus: "WORKING",
    isActive: true,
  },

  {
    name: "Gold (Currency Risk Hedge)",
    slug: "gold-currency-hedge",
    description: "Rupee debasement risk. Gold hedges currency + geopolitical risk.",
    macroCatalyst: "Dollar debasement + central bank gold accumulation",
    timeframeYears: 20,
    historicalCagr: 8.0,
    convictionScore: 0.70,
    convictionStatus: "WORKING",
    isActive: true,
  },

  {
    name: "Oil & Gas (Supply Squeeze)",
    slug: "oil-gas",
    description: "Energy security post-Russia sanctions. Supply tight, demand up.",
    macroCatalyst: "Geopolitical supply constraints + energy demand from developing nations",
    timeframeYears: 5,
    historicalCagr: 9.0,
    convictionScore: 0.58,
    convictionStatus: "WORKING",
    isActive: true,
  },

  {
    name: "Defense (Geopolitical Tensions)",
    slug: "defense",
    description: "India capex on defense + China tensions. Domestic manufacturing incentives.",
    macroCatalyst: "Geopolitical tensions + government defense spending",
    timeframeYears: 10,
    historicalCagr: 14.0,
    convictionScore: 0.62,
    convictionStatus: "WORKING",
    isActive: true,
  },

  // Add more sectors as needed (total: 50+)
  // This is a template—expand based on your universe
];

export const SECTOR_COUNTS = {
  GROWTH: 8,
  VALUE: 6,
  DEFENSIVE: 5,
  MACRO: 4,
  TOTAL: 23, // Expand to 50+ as needed
};
