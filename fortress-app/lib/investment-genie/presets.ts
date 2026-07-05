import { UserProfile } from "./contracts";

export interface StrategyPreset {
  id: string;
  name: string;
  description: string;
  emoji: string;
  profile: Partial<UserProfile>;
  tags: string[];
}

export const STRATEGY_PRESETS: StrategyPreset[] = [
  {
    id: "aggressive-growth",
    name: "Aggressive Growth",
    description: "High-risk, high-reward barbell strategy for 10-year horizon",
    emoji: "🚀",
    profile: {
      horizon: "10yr",
      riskAppetite: 85,
      experience: "experienced",
      incomeStability: "stable",
      countries: ["India", "United States"],
      vehicles: ["Stocks", "ETFs"],
    },
    tags: ["Barbell", "10-Year", "Leverage-Ready"],
  },
  {
    id: "balanced-growth",
    name: "Balanced Growth",
    description: "Moderate risk with steady income focus, 5-year horizon",
    emoji: "⚖️",
    profile: {
      horizon: "5yr",
      riskAppetite: 55,
      experience: "intermediate",
      incomeStability: "stable",
      countries: ["India", "United States"],
      vehicles: ["Stocks", "Mutual Funds", "ETFs"],
    },
    tags: ["Moderate", "5-Year", "Income-Focused"],
  },
  {
    id: "conservative-income",
    name: "Conservative Income",
    description: "Low-risk, dividend-focused approach for capital preservation",
    emoji: "🛡️",
    profile: {
      horizon: "retirement",
      riskAppetite: 30,
      experience: "beginner",
      incomeStability: "stable",
      countries: ["India", "United States"],
      vehicles: ["Mutual Funds", "ETFs"],
    },
    tags: ["Safe", "Retirement", "Dividend-Focus"],
  },
];
