export interface SavedAllocation {
  id: string;
  userId: string;
  amount: string;
  riskAppetite: string;
  horizon: 'short' | 'medium' | 'long' | 'retirement';
  experience: 'beginner' | 'intermediate' | 'experienced';
  countries: string[];
  allocation: Record<string, any>;
  createdAt?: string;
  savedAt?: string;
}

export type SortKey = 'date' | 'amount' | 'horizon';

export interface FilterState {
  sortKey: SortKey;
  horizonFilter: string;
  experienceFilter: string;
  dateFrom?: string;
  dateTo?: string;
}
