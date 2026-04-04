// Intelligence Layer — Shared Types
// The clarity framework: what's happening, why it matters, where you stand.

export type SignalLevel =
  | 'low' | 'moderate' | 'elevated' | 'high' | 'extreme' | 'very_high'
  | 'strong' | 'weak' | 'very_weak'
  | 'calm' | 'fearful'
  | 'bullish' | 'flat' | 'bearish';

export type ImpactDirection = 'positive' | 'negative' | 'neutral' | 'mixed';
export type ImpactStrength = 'strong' | 'moderate' | 'mild';
export type EnvironmentLevel = 'positive' | 'neutral' | 'negative';

export interface SignalEvaluation {
  signal: string;         // machine key e.g. 'crude_oil'
  label: string;          // display name e.g. 'Crude Oil'
  emoji: string;
  value: number | null;
  formattedValue: string; // e.g. '$111.54'
  level: SignalLevel;
  headline: string;       // one-line: what is happening
  explanation: string;    // 2-3 sentences: why it matters
}

export interface SectorImpact {
  sector: string;
  emoji: string;
  market: 'India' | 'US' | 'Global';
  impact: ImpactDirection;
  strength: ImpactStrength;
  clarityText: string;    // one sentence: where this sector stands
}

export interface EnvironmentFactor {
  label: string;          // e.g. 'Demand'
  state: string;          // e.g. 'Weakening'
  level: EnvironmentLevel;
  note: string;           // one sentence explanation
}

export interface IntelligenceReport {
  id: string;
  snapshotDate: string;
  generatedAt: string;
  signals: SignalEvaluation[];
  sectorImpacts: SectorImpact[];
  environment: EnvironmentFactor[];
  summary: string;
}
