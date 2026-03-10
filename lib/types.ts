
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
