
export interface Stock {
    id: string;
    symbol: string;
    name: string;
    sector: string;
    logo_url?: string;
    current_price: number;
    quality_score: number;
    market_cap_crores: number;
    pe_ratio?: number;
    roce_5yr_avg?: number;
    debt_to_equity?: number;
    megatrend: string[];
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
    // Extension fields for v5 compatibility
    tag?: string;
    risk?: string;
    industry?: string;
    drop52w?: number;
    moat?: string;
    l1?: number;
    l2?: number;
    l3?: number;
    l4?: number;
    l5?: number;
    why_down?: string;
    why_buy?: string;
    penny_why?: string;
    multi_bagger_case?: string;
    killer_risk?: string;
    fortress_note?: string;
    ocf?: string;
    v5Category?: "low" | "penny" | "sub_ten" | null;
}

export interface Thesis {
    id: string;
    stock_id: string;
    one_liner: string;
    megatrend?: string[]; // Array in DB
    moat_source?: string;
    financial_strength_score?: number;
    investment_logic: string;
    risks: string;
    author_id?: string;
    published_at?: string;
    updated_at?: string;
}

export interface StockWithThesis extends Stock {
    thesis: Thesis | null;
}

export interface V5Stock extends Stock {
    tag: string;
    risk: string;
    drop52w: number;
    moat: string;
    ocf: string;
    why_down?: string;
    why_buy?: string;
    penny_why?: string;
    multi_bagger_case?: string;
    killer_risk?: string;
    fortress_note?: string;
    l1: number;
    l2: number;
    l3: number;
    l4: number;
    l5: number;
}

export interface Collection {
    id: string;
    name: string;
    slug: string;
    description?: string;
}

export interface CollectionMember {
    collection_id: string;
    stock_id: string;
    weight_conservative: number;
    weight_balanced: number;
    weight_aggressive: number;
    added_at: string;
}

export interface Concept {
    id?: string; // Optional because seed data might not have UUIDs yet
    term: string;
    definition: string;
    category?: string;
    source?: string;
}

export interface MutualFund {
    name: string;
    amc: string;
    category: string;
    cagr5y: number;
    cagr3y: number;
    aum: string;
    minSIP: string;
    risk: string;
    why: string;
    link?: string;
}

export interface IndexFund {
    name: string;
    category: string;
    expense: string;
    tracks: string;
    why: string;
    cagr5y: number;
}

export interface TopPick {
    symbol: string;
    name: string;
    score: number;
    tag: string;
    roce: number;
    de: number;
    sector: string;
    why: string;
}

export interface GlossaryTag {
    name: string;
    color: string;
    emoji: string;
    action: string;
    plain: string;
    recommendation: string;
}

export interface GlossaryRiskLevel {
    level: string;
    color: string;
    emoji: string;
    plain: string;
    examples: string;
}

export interface GlossaryLayer {
    layer: string;
    icon: string;
    color: string;
    plain: string;
    simple: string;
}

export interface GlossaryUpdate {
    freq: string;
    items: string[];
    color: string;
    why: string;
    next: string;
}

// ── Sovereign Alpha GEM SCORE types ──────────────────────────────────────────

export interface GlossaryGemTier {
    tier: string;           // 'Diamond' | 'Sapphire' | 'Emerald' | 'Quartz'
    scoreRange: string;     // '80–100'
    color: string;
    emoji: string;
    plain: string;          // Non-technical description
    action: string;         // What to do
    frequency: string;      // How rare
}

export interface GlossaryGemCriteria {
    name: string;           // 'Undervaluation Edge'
    code: string;           // 'undervaluation'
    weight: number;         // 30
    color: string;
    icon: string;
    plain: string;          // What it measures in simple English
    signals: string[];      // What looks for
    redFlags: string[];     // What disqualifies
}

export interface GlossaryRiskMode {
    mode: string;           // 'Conservative'
    code: string;           // 'conservative'
    color: string;
    emoji: string;
    plain: string;          // Who it's for
    tiers: string[];        // Which gem tiers shown
    maxPicks: number;
    stopLoss: string;
    rules: string[];        // Special rules
}

export interface Glossary {
    tags: GlossaryTag[];
    riskLevels: GlossaryRiskLevel[];
    fortressLayers: GlossaryLayer[];
    updates: GlossaryUpdate[];
    gemTiers: GlossaryGemTier[];
    gemCriteria: GlossaryGemCriteria[];
    riskModes: GlossaryRiskMode[];
}
