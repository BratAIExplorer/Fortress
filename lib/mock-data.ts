import { Stock, MutualFund, IndexFund, TopPick, Glossary } from "./types";

export const mockStocks: Stock[] = [
    {
        id: "1",
        symbol: "RELIANCE",
        name: "Reliance Industries",
        sector: "Energy",
        current_price: 2950.5,
        quality_score: 88,
        market_cap_crores: 1950000,
        megatrend: ["Energy Transition", "Digital India"],
        is_active: true
    },
    {
        id: "2",
        symbol: "TCS",
        name: "Tata Consultancy Services",
        sector: "Technology",
        current_price: 4120.0,
        quality_score: 94,
        market_cap_crores: 1480000,
        megatrend: ["Digital India"],
        is_active: true
    },
    {
        id: "3",
        symbol: "HDFCBANK",
        name: "HDFC Bank",
        sector: "Banking",
        current_price: 1450.2,
        quality_score: 91,
        market_cap_crores: 1120000,
        megatrend: ["Financialization"],
        is_active: true
    },
    {
        id: "4",
        symbol: "INFY",
        name: "Infosys",
        sector: "Technology",
        current_price: 1620.0,
        quality_score: 89,
        market_cap_crores: 680000,
        megatrend: ["Digital India"],
        is_active: true
    },
    {
        id: "5",
        symbol: "ICICIBANK",
        name: "ICICI Bank",
        sector: "Banking",
        current_price: 1080.0,
        quality_score: 90,
        market_cap_crores: 760000,
        megatrend: ["Financialization"],
        is_active: true
    },
    {
        id: "6",
        symbol: "BHARTIARTL",
        name: "Bharti Airtel",
        sector: "Telecom",
        current_price: 1210.0,
        quality_score: 85,
        market_cap_crores: 690000,
        megatrend: ["Digital India"],
        is_active: true
    },
    {
        id: "7",
        symbol: "SBIN",
        name: "State Bank of India",
        sector: "Banking",
        current_price: 760.0,
        quality_score: 82,
        market_cap_crores: 680000,
        megatrend: ["Financialization"],
        is_active: true
    },
    {
        id: "8",
        symbol: "LICI",
        name: "LIC of India",
        sector: "Insurance",
        current_price: 940.0,
        quality_score: 80,
        market_cap_crores: 590000,
        megatrend: ["Financialization"],
        is_active: true
    },
    {
        id: "9",
        symbol: "HINDUNILVR",
        name: "Hindustan Unilever",
        sector: "FMCG",
        current_price: 2420.0,
        quality_score: 92,
        market_cap_crores: 560000,
        megatrend: ["Consumption"],
        is_active: true
    },
    {
        id: "10",
        symbol: "ITC",
        name: "ITC Limited",
        sector: "FMCG",
        current_price: 410.0,
        quality_score: 87,
        market_cap_crores: 510000,
        megatrend: ["Consumption"],
        is_active: true
    },
    {
        id: "11",
        symbol: "LT",
        name: "Larsen & Toubro",
        sector: "Construction",
        current_price: 3450.0,
        quality_score: 89,
        market_cap_crores: 480000,
        megatrend: ["Infra"],
        is_active: true
    },
    {
        id: "12",
        symbol: "BAJFINANCE",
        name: "Bajaj Finance",
        sector: "NBFC",
        current_price: 6600.0,
        quality_score: 91,
        market_cap_crores: 410000,
        megatrend: ["Financialization"],
        is_active: true
    },
    {
        id: "13",
        symbol: "MARUTI",
        name: "Maruti Suzuki",
        sector: "Automobile",
        current_price: 11500.0,
        quality_score: 86,
        market_cap_crores: 360000,
        megatrend: ["Consumption"],
        is_active: true
    },
    {
        id: "14",
        symbol: "ADANIENT",
        name: "Adani Enterprises",
        sector: "Conglomerate",
        current_price: 3100.0,
        quality_score: 75,
        market_cap_crores: 350000,
        megatrend: ["Infra"],
        is_active: true
    },
    {
        id: "15",
        symbol: "KOTAKBANK",
        name: "Kotak Mahindra Bank",
        sector: "Banking",
        current_price: 1720.0,
        quality_score: 89,
        market_cap_crores: 340000,
        megatrend: ["Financialization"],
        is_active: true
    },
    {
        id: "16",
        symbol: "AXISBANK",
        name: "Axis Bank",
        sector: "Banking",
        current_price: 1040.0,
        quality_score: 84,
        market_cap_crores: 320000,
        megatrend: ["Financialization"],
        is_active: true
    },
    {
        id: "17",
        symbol: "SUNPHARMA",
        name: "Sun Pharmaceutical",
        sector: "Pharma",
        current_price: 1550.0,
        quality_score: 88,
        market_cap_crores: 370000,
        megatrend: ["Healthcare"],
        is_active: true
    },
    {
        id: "18",
        symbol: "ADANIPORTS",
        name: "Adani Ports",
        sector: "Infra",
        current_price: 1280.0,
        quality_score: 83,
        market_cap_crores: 280000,
        megatrend: ["Infra"],
        is_active: true
    },
    {
        id: "19",
        symbol: "TITAN",
        name: "Titan Company",
        sector: "Consumer Durables",
        current_price: 3600.0,
        quality_score: 90,
        market_cap_crores: 320000,
        megatrend: ["Consumption"],
        is_active: true
    },
    {
        id: "20",
        symbol: "ULTRACEMCO",
        name: "UltraTech Cement",
        sector: "Materials",
        current_price: 9800.0,
        quality_score: 86,
        market_cap_crores: 285000,
        megatrend: ["Infra"],
        is_active: true
    },
    {
        id: "21",
        symbol: "ASIANPAINT",
        name: "Asian Paints",
        sector: "Materials",
        current_price: 2850.0,
        quality_score: 91,
        market_cap_crores: 275000,
        megatrend: ["Consumption"],
        is_active: true
    },
    {
        id: "22",
        symbol: "BAJAJFINSV",
        name: "Bajaj Finserv",
        sector: "NBFC",
        current_price: 1600.0,
        quality_score: 88,
        market_cap_crores: 255000,
        megatrend: ["Financialization"],
        is_active: true
    },
    {
        id: "23",
        symbol: "NTPC",
        name: "NTPC Limited",
        sector: "Energy",
        current_price: 330.0,
        quality_score: 81,
        market_cap_crores: 320000,
        megatrend: ["Energy Transition"],
        is_active: true
    },
    {
        id: "24",
        symbol: "M&M",
        name: "Mahindra & Mahindra",
        sector: "Automobile",
        current_price: 1900.0,
        quality_score: 87,
        market_cap_crores: 235000,
        megatrend: ["Consumption", "EV"],
        is_active: true
    },
    {
        id: "25",
        symbol: "ADANIPOWER",
        name: "Adani Power",
        sector: "Energy",
        current_price: 560.0,
        quality_score: 72,
        market_cap_crores: 215000,
        megatrend: ["Energy Transition"],
        is_active: true
    },
    {
        id: "26",
        symbol: "TATASTEEL",
        name: "Tata Steel",
        sector: "Materials",
        current_price: 145.0,
        quality_score: 80,
        market_cap_crores: 180000,
        megatrend: ["Infra"],
        is_active: true
    },
    {
        id: "27",
        symbol: "PIDILITIND",
        name: "Pidilite Industries",
        sector: "Chemicals",
        current_price: 2900.0,
        quality_score: 93,
        market_cap_crores: 147000,
        megatrend: ["Consumption"],
        is_active: true
    },
    {
        id: "28",
        symbol: "BAJAJ-AUTO",
        name: "Bajaj Auto",
        sector: "Automobile",
        current_price: 8500.0,
        quality_score: 87,
        market_cap_crores: 240000,
        megatrend: ["Consumption", "EV"],
        is_active: true
    },
    {
        id: "29",
        symbol: "HAL",
        name: "Hindustan Aeronautics",
        sector: "Defense",
        current_price: 3500.0,
        quality_score: 85,
        market_cap_crores: 230000,
        megatrend: ["Defense"],
        is_active: true
    },
    {
        id: "30",
        symbol: "BEL",
        name: "Bharat Electronics",
        sector: "Defense",
        current_price: 210.0,
        quality_score: 84,
        market_cap_crores: 153000,
        megatrend: ["Defense"],
        is_active: true
    }
];

export const v5LowStocks: Stock[] = [
    { id: "v5-1", symbol: "ASIANPAINT", name: "Asian Paints", sector: "FMCG", industry: "Paints", current_price: 2180, drop52w: -38, debt_to_equity: 0.0, roce_5yr_avg: 32.4, ocf: "5/5", moat: "Paint Distribution Monopoly", l1: 5, l2: 5, l3: 3, l4: 3, l5: 5, why_down: "New competition from Birla Opus + crude-linked input cost pressure on margins.", why_buy: "55% market share, 32% ROCE, zero debt. Birla threat overpriced in. Buying a 30-year compounder at 2019 prices.", tag: "QUALITY ON SALE", risk: "LOW", quality_score: 84, is_active: true, megatrend: ["Consumption"], market_cap_crores: 275000 },
    { id: "v5-2", symbol: "PIDILITIND", name: "Pidilite Industries", sector: "FMCG", industry: "Adhesives", current_price: 2420, drop52w: -28, debt_to_equity: 0.02, roce_5yr_avg: 29.6, ocf: "5/5", moat: "Fevicol Brand Monopoly", l1: 5, l2: 5, l3: 3, l4: 4, l5: 5, why_down: "Slower real estate cycle + VAM input cost spikes squeezed margins.", why_buy: "Fevicol so dominant carpenters call ALL adhesives 'Fevicol'. Input costs cyclical; moat is permanent.", tag: "QUALITY ON SALE", risk: "LOW", quality_score: 88, is_active: true, megatrend: ["Consumption"], market_cap_crores: 147000 },
    { id: "v5-3", symbol: "MARICO", name: "Marico", sector: "FMCG", industry: "Hair Care", current_price: 542, drop52w: -22, debt_to_equity: 0.0, roce_5yr_avg: 38.2, ocf: "5/5", moat: "Parachute Coconut Moat", l1: 5, l2: 5, l3: 3, l4: 3, l5: 5, why_down: "Copra prices surged — compressing Parachute margins temporarily.", why_buy: "38% ROCE with zero debt. Copra prices cyclical. Saffola foods growing 20%+.", tag: "QUALITY ON SALE", risk: "LOW", quality_score: 84, is_active: true, megatrend: ["Consumption"], market_cap_crores: 65000 },
    { id: "v5-4", symbol: "DABUR", name: "Dabur India", sector: "FMCG", industry: "Ayurveda", current_price: 498, drop52w: -26, debt_to_equity: 0.06, roce_5yr_avg: 24.8, ocf: "5/5", moat: "100-Year Ayurvedic Trust", l1: 5, l2: 4, l3: 3, l4: 3, l5: 4, why_down: "Rural demand slowdown + Real juice category facing competition.", why_buy: "Trusted for 100+ years. Rural recovery FY26 = immediate volume upside. Dividend 1.8% — paid to wait.", tag: "PATIENT PICK", risk: "LOW", quality_score: 76, is_active: true, megatrend: ["Rural Recovery"], market_cap_crores: 88000 },
    { id: "v5-5", symbol: "HCLTECH", name: "HCL Technologies", sector: "IT", industry: "Software Services", current_price: 1380, drop52w: -19, debt_to_equity: 0.04, roce_5yr_avg: 26.4, ocf: "5/5", moat: "Engineering R&D + Cloud", l1: 5, l2: 4, l3: 3, l4: 4, l5: 4, why_down: "Global IT spending slowdown. US BFSI clients cutting discretionary tech spend.", why_buy: "Most undervalued of Big 4 IT. 26% ROCE. Dividend yield 3.5% at current price.", tag: "DEEP VALUE", risk: "LOW", quality_score: 80, is_active: true, megatrend: ["Digital India"], market_cap_crores: 375000 },
    { id: "v5-6", symbol: "MPHASIS", name: "Mphasis", sector: "IT", industry: "Financial Tech IT", current_price: 1820, drop52w: -33, debt_to_equity: 0.0, roce_5yr_avg: 28.6, ocf: "4/5", moat: "Blackstone-backed US Banking IT", l1: 5, l2: 4, l3: 3, l4: 3, l5: 4, why_down: "DXC renegotiation + US mortgage/banking IT spend frozen due to high rates.", why_buy: "When Fed cuts rates, mortgage originations restart = instant recovery. Zero debt, 28% ROCE.", tag: "TRIGGER PLAY", risk: "MEDIUM", quality_score: 76, is_active: true, megatrend: ["Digital India"], market_cap_crores: 35000 },
    { id: "v5-7", symbol: "WIPRO", name: "Wipro", sector: "IT", industry: "Software Services", current_price: 278, drop52w: -24, debt_to_equity: 0.0, roce_5yr_avg: 16.8, ocf: "5/5", moat: "Enterprise IT Scale", l1: 4, l2: 3, l3: 3, l4: 3, l5: 3, why_down: "Multiple quarters of revenue decline. Lost share to Infosys and HCL.", why_buy: "Zero debt, ₹20,000 Cr cash. At 15x PE, cheapest large-cap IT in India. Turnaround deal wins improving.", tag: "TURNAROUND WATCH", risk: "MEDIUM", quality_score: 64, is_active: true, megatrend: ["Digital India"], market_cap_crores: 250000 },
    { id: "v5-8", symbol: "DRREDDY", name: "Dr Reddy's", sector: "Pharma", industry: "Pharmaceuticals", current_price: 1068, drop52w: -29, debt_to_equity: 0.06, roce_5yr_avg: 18.4, ocf: "4/5", moat: "Generic + Biosimilar Global", l1: 4, l2: 4, l3: 4, l4: 4, l5: 4, why_down: "FDA warning letter for one plant + pricing erosion in legacy US generics.", why_buy: "FDA issues plant-specific and resolvable. Biosimilar pipeline adds ₹2,000 Cr by FY27.", tag: "TRIGGER PLAY", risk: "MEDIUM", quality_score: 80, is_active: true, megatrend: ["Healthcare"], market_cap_crores: 110000 },
    { id: "v5-9", symbol: "MARUTI", name: "Maruti Suzuki", sector: "Auto", industry: "Passenger Cars", current_price: 10800, drop52w: -18, debt_to_equity: 0.0, roce_5yr_avg: 18.6, ocf: "5/5", moat: "Mass Market Car Distribution", l1: 4, l2: 4, l3: 3, l4: 3, l5: 5, why_down: "EV disruption fears + Hyundai/Tata gaining SUV share.", why_buy: "45% of all cars sold in India are Maruti. Zero debt. 4,500+ service centres impossible to replicate.", tag: "DEEP VALUE", risk: "LOW", quality_score: 76, is_active: true, megatrend: ["Consumption"], market_cap_crores: 360000 },
    { id: "v5-10", symbol: "HEROMOTOCO", name: "Hero MotoCorp", sector: "Auto", industry: "2-Wheeler", current_price: 3820, drop52w: -24, debt_to_equity: 0.0, roce_5yr_avg: 22.8, ocf: "5/5", moat: "Rural 2-Wheeler King", l1: 5, l2: 4, l3: 3, l4: 3, l5: 4, why_down: "EV narrative punishing ICE 2-wheelers.", why_buy: "40% of Indian villages have a Hero dealership. Zero debt, 22% ROCE, ₹100/share dividend.", tag: "DEEP VALUE", risk: "LOW", quality_score: 76, is_active: true, megatrend: ["Consumption"], market_cap_crores: 80000 },
    { id: "v5-11", symbol: "CLEANSCI", name: "Clean Science & Tech", sector: "Chemicals", industry: "Specialty Chem", current_price: 1020, drop52w: -42, debt_to_equity: 0.0, roce_5yr_avg: 26.8, ocf: "4/5", moat: "Green Chemistry Patent", l1: 5, l2: 5, l3: 3, l4: 3, l5: 4, why_down: "MEHQ and BHA prices fell sharply.", why_buy: "Process 40% cheaper than competitors — permanent cost moat. Zero debt, 26% ROCE at 52W low.", tag: "HIGH CONVICTION DIP", risk: "MEDIUM", quality_score: 80, is_active: true, megatrend: ["China+1"], market_cap_crores: 12000 },
    { id: "v5-12", symbol: "VINATIORGA", name: "Vinati Organics", sector: "Chemicals", industry: "Specialty Chem", current_price: 1480, drop52w: -36, debt_to_equity: 0.01, roce_5yr_avg: 22.4, ocf: "4/5", moat: "Global ATBS Monopoly", l1: 5, l2: 5, l3: 3, l4: 3, l5: 5, why_down: "ATBS prices crashed — China flooding market below cost.", why_buy: "One of only 2 global ATBS producers. When prices normalize, Vinati snaps back hard.", tag: "TRIGGER PLAY", risk: "MEDIUM", quality_score: 84, is_active: true, megatrend: ["China+1"], market_cap_crores: 18000 },
    { id: "v5-13", symbol: "PAGEIND", name: "Page Industries (Jockey)", sector: "Consumer", industry: "Innerwear", current_price: 36000, drop52w: -29, debt_to_equity: 0.0, roce_5yr_avg: 62.4, ocf: "5/5", moat: "Jockey Brand Premium India", l1: 5, l2: 5, l3: 3, l4: 3, l5: 5, why_down: "Volume growth decelerated. Distributor inventory pile-up.", why_buy: "62% ROCE — one of highest globally. Zero debt. Inventory normalises in 1–2 quarters.", tag: "HIGH CONVICTION DIP", risk: "LOW", quality_score: 84, is_active: true, megatrend: ["Consumption"], market_cap_crores: 42000 },
    { id: "v5-14", symbol: "CUMMINSIND", name: "Cummins India", sector: "Capital Goods", industry: "Engines", current_price: 2680, drop52w: -27, debt_to_equity: 0.0, roce_5yr_avg: 30.2, ocf: "5/5", moat: "Industrial Engine Monopoly", l1: 5, l2: 5, l3: 3, l4: 3, l5: 5, why_down: "Export revenue declined — US/Europe industrial capex slowing.", why_buy: "30% ROCE, zero debt. India's data centre boom = massive backup generator demand.", tag: "QUALITY ON SALE", risk: "LOW", quality_score: 84, is_active: true, megatrend: ["Infra"], market_cap_crores: 75000 },
    { id: "v5-15", symbol: "POLYCAB", name: "Polycab India", sector: "Capital Goods", industry: "Wires & Cables", current_price: 4800, drop52w: -23, debt_to_equity: 0.02, roce_5yr_avg: 24.8, ocf: "4/5", moat: "Wire Distribution Network", l1: 5, l2: 4, l3: 4, l4: 4, l5: 4, why_down: "IT tax survey created governance uncertainty.", why_buy: "No major fraud found — market overreacted. India's #1 cable company.", tag: "TRIGGER PLAY", risk: "MEDIUM", quality_score: 84, is_active: true, megatrend: ["Infra"], market_cap_crores: 72000 },
    { id: "v5-16", symbol: "ASTRAL", name: "Astral Ltd", sector: "Building Materials", industry: "Pipes & Adhesives", current_price: 1480, drop52w: -32, debt_to_equity: 0.04, roce_5yr_avg: 22.6, ocf: "4/5", moat: "CPVC Pipe + Rex Adhesive", l1: 5, l2: 4, l3: 3, l4: 3, l5: 4, why_down: "Real estate slowdown + CPVC resin import costs rising.", why_buy: "CPVC pipes replacing GI pipes in every renovation — secular demand. 22% ROCE near-zero debt.", tag: "QUALITY ON SALE", risk: "LOW", quality_score: 76, is_active: true, megatrend: ["Infra"], market_cap_crores: 40000 },
    { id: "v5-17", symbol: "AXISBANK", name: "Axis Bank", sector: "BFSI", industry: "Banking", current_price: 1020, drop52w: -22, debt_to_equity: 0, roce_5yr_avg: 14.6, ocf: "4/5", moat: "Private Banking Franchise", l1: 3, l2: 4, l3: 4, l4: 4, l5: 3, why_down: "Citi integration cost higher than expected. Unsecured lending slippages rising.", why_buy: "Citi integration nearly complete. 40% discount to HDFC Bank. Any NPA improvement = sharp re-rating.", tag: "TRIGGER PLAY", risk: "MEDIUM", quality_score: 72, is_active: true, megatrend: ["Financialization"], market_cap_crores: 320000 },
    { id: "v5-18", symbol: "INDUSINDBK", name: "IndusInd Bank", sector: "BFSI", industry: "Banking", current_price: 780, drop52w: -48, debt_to_equity: 0, roce_5yr_avg: 13.2, ocf: "3/5", moat: "Vehicle Finance + Microfinance", l1: 2, l2: 3, l3: 3, l4: 3, l5: 2, why_down: "Accounting irregularities disclosed. CEO uncertainty.", why_buy: "HIGH RISK. New management + clean-up = potential recovery. Vehicle finance franchise is healthy.", tag: "HIGH RISK RECOVERY", risk: "HIGH", quality_score: 52, is_active: true, megatrend: ["Financialization"], market_cap_crores: 60000 },
    { id: "v5-19", symbol: "ZEEL", name: "Zee Entertainment", sector: "Media", industry: "Broadcasting", current_price: 118, drop52w: -52, debt_to_equity: 0.22, roce_5yr_avg: 7.2, ocf: "2/5", moat: "Hindi GEC Brand Portfolio", l1: 2, l2: 3, l3: 2, l4: 2, l5: 1, why_down: "Sony merger collapsed. Promoter credibility destroyed.", why_buy: "⚠ FORTRESS AVOID. Cheap ≠ good buy. Governance failure (L5=1/5). Cautionary example only.", tag: "⚠ FORTRESS AVOID", risk: "VERY HIGH", quality_score: 40, is_active: true, megatrend: ["Consumption"], market_cap_crores: 12000 },
];

export const v5PennyStocks: Stock[] = [
    { id: "p-1", symbol: "MOIL", name: "MOIL Ltd", sector: "Mining", industry: "Manganese Ore", current_price: 338, drop52w: -26, debt_to_equity: 0.0, roce_5yr_avg: 22.4, ocf: "5/5", moat: "India's Only Manganese Miner", l1: 5, l2: 5, l3: 4, l4: 3, l5: 4, why_down: "Manganese prices fell globally. Steel slowdown fears.", why_buy: "India's only manganese miner. Zero debt, 22% ROCE, consistent dividend. EV battery demand = emerging second revenue stream.", tag: "🎰 PENNY — QUALIFIED", risk: "MEDIUM", penny_why: "Niche commodity — no analyst coverage = perpetual undervaluation. Passes all 5 layers.", quality_score: 84, is_active: true, megatrend: ["EV"], market_cap_crores: 8000 },
    { id: "p-2", symbol: "RATNAMANI", name: "Ratnamani Metals & Tubes", sector: "Capital Goods", industry: "Specialty Steel Pipes", current_price: 2840, drop52w: -22, debt_to_equity: 0.04, roce_5yr_avg: 22.6, ocf: "4/5", moat: "Stainless + Carbon Steel Tube Niche", l1: 5, l2: 4, l3: 4, l4: 4, l5: 4, why_down: "Oil & gas capex slowdown globally.", why_buy: "Specialty tubes for oil refineries, chemical plants, power stations. Near-zero debt, 22% ROCE.", tag: "🎰 PENNY — QUALIFIED", risk: "LOW", penny_why: "Market cap under ₹5,000 Cr = below most institutional radars despite excellent fundamentals.", quality_score: 84, is_active: true, megatrend: ["Infra"], market_cap_crores: 15000 },
    { id: "p-3", symbol: "RAILTEL", name: "RailTel Corporation", sector: "Technology", industry: "Telecom Infrastructure PSU", current_price: 348, drop52w: -32, debt_to_equity: 0.0, roce_5yr_avg: 16.8, ocf: "4/5", moat: "55,000 km Railway Fibre Network", l1: 4, l2: 4, l3: 5, l4: 3, l5: 4, why_down: "Slower government project execution + PSU discount.", why_buy: "55,000 km OFC across all Indian railway routes. Zero debt PSU. BharatNet contracts = assured revenue.", tag: "🎰 PENNY — QUALIFIED", risk: "MEDIUM", penny_why: "PSU + telecom = double discount. Infrastructure value exceeds market cap at current price.", quality_score: 80, is_active: true, megatrend: ["Digital India"], market_cap_crores: 11000 },
    { id: "p-4", symbol: "SUZLON", name: "Suzlon Energy", sector: "Renewable Energy", industry: "Wind Energy", current_price: 54, drop52w: -28, debt_to_equity: 0.08, roce_5yr_avg: 18.4, ocf: "4/5", moat: "India Wind Energy #1 — Debt Cleared", l1: 4, l2: 4, l3: 5, l4: 4, l5: 3, why_down: "Institutional memory of old debt overhang keeps big money away.", why_buy: "DEBT IS CLEARED. India's largest wind turbine maker. 500GW renewable target = decade of orders.", tag: "🎰 PENNY — QUALIFIED", risk: "HIGH", penny_why: "Institutional memory of 'old Suzlon' is your opportunity. Business is fundamentally different now.", quality_score: 80, is_active: true, megatrend: ["Energy Transition"], market_cap_crores: 75000 },
    { id: "p-5", symbol: "NMDC", name: "NMDC Ltd", sector: "Mining", industry: "Iron Ore PSU", current_price: 68, drop52w: -22, debt_to_equity: 0.04, roce_5yr_avg: 18.6, ocf: "5/5", moat: "India's Largest Iron Ore Producer", l1: 4, l2: 4, l3: 4, l4: 3, l5: 4, why_down: "Iron ore price correction globally.", why_buy: "Sovereign-owned, near-zero debt, 5%+ dividend yield. Every factory, bridge, building = NMDC revenue.", tag: "🎰 PENNY — QUALIFIED", risk: "MEDIUM", penny_why: "PSU discount — government companies are automatically undervalued by the market.", quality_score: 76, is_active: true, megatrend: ["Infra"], market_cap_crores: 20000 },
    { id: "p-6", symbol: "GPIL", name: "Godawari Power & Ispat", sector: "Metals", industry: "Integrated Steel + Power", current_price: 620, drop52w: -38, debt_to_equity: 0.22, roce_5yr_avg: 28.4, ocf: "4/5", moat: "Iron Ore + Steel + Power Integration", l1: 4, l2: 4, l3: 4, l4: 3, l5: 4, why_down: "Steel cycle correction + China flooding global market.", why_buy: "Vertically integrated — mines own iron ore, makes pellets, smelts steel, generates power. 28% ROCE in steel is exceptional.", tag: "🎰 PENNY — QUALIFIED", risk: "MEDIUM", penny_why: "Chhattisgarh-based mid-cap with zero analyst coverage = persistent undervaluation.", quality_score: 76, is_active: true, megatrend: ["Infrastructure"], market_cap_crores: 8000 },
    { id: "p-7", symbol: "HFCL", name: "HFCL Ltd", sector: "Technology", industry: "Fibre Optics / Defence", current_price: 68, drop52w: -34, debt_to_equity: 0.28, roce_5yr_avg: 14.2, ocf: "3/5", moat: "Defence Fibre Optics Specialist", l1: 3, l2: 4, l3: 5, l4: 4, l5: 3, why_down: "Slower government tender payments.", why_buy: "BharatNet Phase 3 + Defence optical cables = sovereign demand. Growing from low base.", tag: "🎰 PENNY — QUALIFIED", risk: "HIGH", penny_why: "Government payment timing creates patchy cash flow. Order book is real and sovereign.", quality_score: 76, is_active: true, megatrend: ["Digital India", "Defense"], market_cap_crores: 9500 },
    { id: "p-8", symbol: "IRCON", name: "IRCON International", sector: "Infrastructure", industry: "Railway EPC PSU", current_price: 188, drop52w: -29, debt_to_equity: 0.04, roce_5yr_avg: 16.8, ocf: "4/5", moat: "International Railway EPC", l1: 4, l2: 3, l3: 5, l4: 3, l5: 4, why_down: "Railway capex cycle timing + PSU discount.", why_buy: "Builds railways across India, Asia, Africa, Middle East. Zero debt, 16% ROCE, consistent dividend.", tag: "🎰 PENNY — QUALIFIED", risk: "MEDIUM", penny_why: "International PSU — too complex and boring for most retail investors.", quality_score: 76, is_active: true, megatrend: ["Infra"], market_cap_crores: 17000 },
    { id: "p-9", symbol: "BANKOFMAH", name: "Bank of Maharashtra", sector: "BFSI", industry: "PSU Banking", current_price: 55, drop52w: -18, debt_to_equity: 0, roce_5yr_avg: 14.2, ocf: "4/5", moat: "Best NPA Ratio Among PSU Banks", l1: 3, l2: 3, l3: 4, l4: 3, l5: 4, why_down: "General PSU bank discount.", why_buy: "Ranked #1 among PSU banks in NPA reduction for 3 consecutive years. Clean books + government backing.", tag: "🎰 PENNY — QUALIFIED", risk: "MEDIUM", penny_why: "Market treats all PSU banks equally. Bank of Maharashtra is an exception most don't know.", quality_score: 68, is_active: true, megatrend: ["Financialization"], market_cap_crores: 38000 },
    { id: "p-10", symbol: "HUDCO", name: "HUDCO", sector: "Infrastructure", industry: "Housing Finance PSU", current_price: 148, drop52w: -38, debt_to_equity: 8.4, roce_5yr_avg: 10.2, ocf: "4/5", moat: "PM Awas Yojana Anchor", l1: 2, l2: 3, l3: 5, l4: 3, l5: 4, why_down: "High D/E + PSU HFC de-rating.", why_buy: "PM Awas Yojana = HUDCO's business case for a decade. Note: High D/E is NORMAL for housing finance.", tag: "🎰 PENNY — QUALIFIED", risk: "HIGH", penny_why: "Housing finance PSU = boring + leverage = double discount. Sovereign mandate protects it.", quality_score: 68, is_active: true, megatrend: ["Infra", "Financialization"], market_cap_crores: 29000 },
    { id: "p-11", symbol: "PTCIND", name: "PTC India Ltd", sector: "Energy", industry: "Power Trading", current_price: 122, drop52w: -24, debt_to_equity: 0.06, roce_5yr_avg: 12.8, ocf: "4/5", moat: "India's Largest Power Exchange", l1: 3, l2: 3, l3: 5, l4: 3, l5: 3, why_down: "PTC Financial subsidiary controversy.", why_buy: "India's largest power trader by volume. Every rupee of renewable energy sold passes through PTC.", tag: "🎰 PENNY — QUALIFIED", risk: "MEDIUM", penny_why: "Subsidiary controversy tainted the parent. Clean trading business hasn't been re-rated yet.", quality_score: 68, is_active: true, megatrend: ["Energy Transition"], market_cap_crores: 3500 },
    { id: "p-12", symbol: "TRIDENT", name: "Trident Ltd", sector: "Textiles", industry: "Towels & Paper", current_price: 32, drop52w: -31, debt_to_equity: 0.38, roce_5yr_avg: 14.8, ocf: "3/5", moat: "US Towel Export Leader", l1: 3, l2: 3, l3: 3, l4: 3, l5: 4, why_down: "US retail destocking + cotton prices volatile.", why_buy: "#1 supplier of towels to Walmart and Target. When US inventory normalises, massive orders return.", tag: "🎰 PENNY — QUALIFIED", risk: "HIGH", penny_why: "Textiles structurally undervalued in India. US slowdown fear hammered it disproportionately.", quality_score: 64, is_active: true, megatrend: ["Textile Exports"], market_cap_crores: 16000 },
    { id: "p-13", symbol: "MOREPEN", name: "Morepen Laboratories", sector: "Pharma", industry: "API + Consumer", current_price: 42, drop52w: -29, debt_to_equity: 0.18, roce_5yr_avg: 14.2, ocf: "3/5", moat: "Loratadine API + Dr Morepen Brand", l1: 3, l2: 3, l3: 3, l4: 3, l5: 3, why_down: "API pricing pressure + slow consumer healthcare growth.", why_buy: "One of only 3 global Loratadine API producers. Dr Morepen glucose monitors: 15% market share.", tag: "🎰 PENNY — QUALIFIED", risk: "HIGH", penny_why: "Too small for institutional attention. Classic under-radar stock with two real moats.", quality_score: 60, is_active: true, megatrend: ["Healthcare"], market_cap_crores: 2200 },
    { id: "p-14", symbol: "CENTRALBNK", name: "Central Bank of India", sector: "BFSI", industry: "PSU Banking", current_price: 52, drop52w: -19, debt_to_equity: 0, roce_5yr_avg: 10.4, ocf: "3/5", moat: "Pan-India PSU Bank Network", l1: 2, l2: 3, l3: 4, l4: 3, l5: 3, why_down: "Slower credit growth + PSU valuation compression.", why_buy: "NPA cleaning up. Rural/semi-urban penetration deep. Trading at 0.5x book. Government will not allow failure.", tag: "🎰 PENNY — QUALIFIED", risk: "HIGH", penny_why: "Market treats all PSU banks equally. Central Bank is improving but gets the same blanket discount.", quality_score: 60, is_active: true, megatrend: ["Financialization", "Rural Recovery"], market_cap_crores: 45000 },
    { id: "p-15", symbol: "YESBANK", name: "Yes Bank", sector: "BFSI", industry: "Banking", current_price: 19, drop52w: -24, debt_to_equity: 0, roce_5yr_avg: 6.8, ocf: "3/5", moat: "SBI-Backed Private Bank Rebuild", l1: 2, l2: 3, l3: 3, l4: 3, l5: 3, why_down: "Near-collapse 2020. Trust destroyed. Corporate clients left permanently.", why_buy: "Retail banking recovering. MSME loans growing. Prashant Kumar-led management is disciplined. Long slow rebuild.", tag: "🎰 PENNY — QUALIFIED", risk: "HIGH", penny_why: "'Never again' institutional memory keeps stock suppressed as business slowly rebuilds.", quality_score: 56, is_active: true, megatrend: ["Financialization"], market_cap_crores: 55000 },
    { id: "p-16", symbol: "HATHWAY", name: "Hathway Cable & Datacom", sector: "Technology", industry: "Cable + Broadband", current_price: 18, drop52w: -28, debt_to_equity: 0.42, roce_5yr_avg: 6.4, ocf: "3/5", moat: "Reliance-Backed Broadband Network", l1: 2, l2: 2, l3: 3, l4: 3, l5: 4, why_down: "JioFiber ARPU pressure. Subscriber growth slowing.", why_buy: "Reliance owns Hathway. 35,000 km cable network in Tier 2/3 cities. Quiet integration play.", tag: "🎰 PENNY — QUALIFIED", risk: "HIGH", penny_why: "Reliance doesn't hype subsidiaries until ready to rerate. Borderline 56/100 — keep very small.", quality_score: 56, is_active: true, megatrend: ["Digital India"], market_cap_crores: 3200 },
    { id: "p-17", symbol: "IDFCLTD", name: "IDFC Ltd", sector: "BFSI", industry: "Financial Services Holdco", current_price: 98, drop52w: -21, debt_to_equity: 0, roce_5yr_avg: 9.4, ocf: "3/5", moat: "Infrastructure Finance Holdco Discount", l1: 2, l2: 3, l3: 3, l4: 3, l5: 3, why_down: "Post-bank merger restructuring. Holdco complexity.", why_buy: "Converting to pure holdco. Sum-of-parts shows massive discount to intrinsic value. Patient investor play.", tag: "🎰 PENNY — QUALIFIED", risk: "HIGH", penny_why: "Holdcos globally trade at 20–40% discount to parts. IDFC's discount appears excessive.", quality_score: 56, is_active: true, megatrend: ["Financialization"], market_cap_crores: 15600 },
];

export const v5SubTenStocks: Stock[] = [
    { id: "s-1", symbol: "IDEA", name: "Vodafone Idea (Vi)", sector: "Telecom", industry: "Telecom Services", current_price: 8, drop52w: -54, debt_to_equity: 0, roce_5yr_avg: -4.2, ocf: "1/5", moat: "140M Subscribers + Govt Equity Stake", l1: 1, l2: 1, l3: 3, l4: 1, l5: 2, why_down: "Perpetual losses, ₹2L Cr AGR dues, subscriber erosion to Jio and Airtel.", multi_bagger_case: "Government converted ₹16,000 Cr debt to equity — they have a political stake in survival. India cannot be a 2-telecom nation by policy. If the ₹18,000 Cr fundraise succeeds + 5G launches in 50 cities, subscriber churn slows dramatically. At ₹8, even a partial recovery to ₹20 = 2.5x.", killer_risk: "The fundraise may not close. Even if it does, Jio's pricing power may make Vi permanently unprofitable.", tag: "💥 EXTREME SPECULATIVE", risk: "EXTREME", fortress_note: "Fails L1, L2, L4. Included only for survival-bet thesis transparency.", quality_score: 32, is_active: true, megatrend: ["Digital India"], market_cap_crores: 45000 },
    { id: "s-2", symbol: "GTLINFRA", name: "GTL Infrastructure", sector: "Telecom", industry: "Telecom Towers", current_price: 2.5, drop52w: -18, debt_to_equity: 6.8, roce_5yr_avg: -2.4, ocf: "2/5", moat: "28,000 Telecom Towers Across India", l1: 1, l2: 2, l3: 3, l4: 2, l5: 2, why_down: "Massive debt from 2010–2015 acquisition spree. Debt restructuring still ongoing.", multi_bagger_case: "Owns 28,000 towers. Tower industry consolidation means GTL's infrastructure could be acquired by Indus Towers or American Tower Corp. If debt is restructured at even 50 paise on rupee, equity could jump 5x from ₹2.5 to ₹12.", killer_risk: "Debt restructuring has been 'ongoing' for 10 years. Creditors may choose liquidation over revival.", tag: "💥 EXTREME SPECULATIVE", risk: "EXTREME", fortress_note: "Asset play only. Business generates negative returns. Pure restructuring bet.", quality_score: 36, is_active: true, megatrend: ["Digital India"], market_cap_crores: 3200 },
    { id: "s-3", symbol: "IFCI", name: "IFCI Ltd", sector: "BFSI", industry: "Government NBFC", current_price: 8, drop52w: -32, debt_to_equity: 0, roce_5yr_avg: 3.2, ocf: "3/5", moat: "Government-Owned Development Finance", l1: 1, l2: 2, l3: 3, l4: 2, l5: 3, why_down: "Legacy NPA book from industrial lending. Privatisation rumours on and off for a decade.", multi_bagger_case: "Government has been reducing its stake. Any privatisation announcement or strategic investor entry could rerate the stock 3x–5x overnight. At ₹8, book value is substantially higher. Pure privatisation option.", killer_risk: "Government privatisation plans are notoriously delayed. IFCI could continue as a zombie institution for another decade.", tag: "💥 EXTREME SPECULATIVE", risk: "EXTREME", fortress_note: "Privatisation option. Probability of outcome low but payoff is large if triggered.", quality_score: 44, is_active: true, megatrend: ["Financialization"], market_cap_crores: 2100 },
    { id: "s-4", symbol: "JPASSOCIAT", name: "JP Associates", sector: "Infrastructure", industry: "Cement + Hotels + Real Estate", current_price: 7, drop52w: -28, debt_to_equity: 4.2, roce_5yr_avg: -1.8, ocf: "2/5", moat: "Yamuna Expressway + Hotel Assets", l1: 1, l2: 2, l3: 3, l4: 2, l5: 1, why_down: "JP Associates group collapsed under debt. NCLT proceedings. Accounting questions.", multi_bagger_case: "Yamuna Expressway alone carries massive toll revenue. Cement plants are operational. Hotel assets (Jaypee Greens) are real. If debt resolution leads to a clean entity, asset value far exceeds market cap. Suitors like Adani have circled these assets.", killer_risk: "NCLT proceedings could result in equity getting wiped out entirely. This has happened to other JP group companies.", tag: "💥 EXTREME SPECULATIVE", risk: "EXTREME", fortress_note: "Asset liquidation play. Equity could be zero or could 5x. No middle ground.", quality_score: 36, is_active: true, megatrend: ["Infra"], market_cap_crores: 1700 },
    { id: "s-5", symbol: "SADBHAV", name: "Sadbhav Infrastructure", sector: "Infrastructure", industry: "HAM Highway Projects", current_price: 6, drop52w: -45, debt_to_equity: 3.8, roce_5yr_avg: 5.4, ocf: "2/5", moat: "HAM Highway Portfolio — Annuity Revenue", l1: 1, l2: 2, l3: 4, l4: 2, l5: 2, why_down: "HAM (Hybrid Annuity Model) projects = government pays in 5-year instalments. Cash flow lag + high debt from project construction.", multi_bagger_case: "HAM projects are sovereign-guaranteed annuities. As construction completes and government payments start flowing, the annuity value is predictable. If NHAI payments accelerate (which they have been under Modi government), debt repayment accelerates and equity unlocks.", killer_risk: "Any NHAI payment delays cascade into covenant breaches and potential insolvency. HAM model is highly leveraged.", tag: "💥 EXTREME SPECULATIVE", risk: "EXTREME", fortress_note: "HAM annuity recovery play. Real infrastructure assets but precarious capital structure.", quality_score: 44, is_active: true, megatrend: ["Infra"], market_cap_crores: 950 },
    { id: "s-6", symbol: "NAGAFERT", name: "Nagarjuna Fertilizers", sector: "Agriculture", industry: "Fertilizers", current_price: 5, drop52w: -22, debt_to_equity: 2.8, roce_5yr_avg: 4.8, ocf: "2/5", moat: "Fertilizer Plant Capacity + Govt Subsidy", l1: 1, l2: 2, l3: 3, l4: 2, l5: 2, why_down: "Fertilizer sector debt overhang. Gas price volatility squeezes margins. Government subsidy delays.", multi_bagger_case: "Government has committed to fertilizer plant restarts under food security mission. Natural gas price normalisation (post-Ukraine) improves margins dramatically. Operating leverage means a small EBITDA improvement = huge PAT swing.", killer_risk: "Government subsidy disbursement delays can make the company technically insolvent even if the business is operating.", tag: "💥 EXTREME SPECULATIVE", risk: "EXTREME", fortress_note: "Operating leverage play on gas prices + govt subsidy. Binary outcome.", quality_score: 40, is_active: true, megatrend: ["Agriculture"], market_cap_crores: 1200 },
    { id: "s-7", symbol: "UNITECH", name: "Unitech Ltd", sector: "Real Estate", industry: "Residential Real Estate", current_price: 6, drop52w: -31, debt_to_equity: 0, roce_5yr_avg: -8.2, ocf: "1/5", moat: "Large Land Bank Across NCR + Other Cities", l1: 1, l2: 1, l3: 3, l4: 1, l5: 1, why_down: "Supreme Court-monitored restructuring after massive homebuyer fraud. Management arrested.", multi_bagger_case: "Supreme Court has appointed a new board. Homebuyer settlements are being processed. IF the land bank is monetised orderly and new management completes remaining projects, there is residual equity value. Completely dependent on SC-monitored process.", killer_risk: "Supreme Court could order liquidation. New management may find the land bank is encumbered beyond recovery. Do NOT buy without reading the SC order.", tag: "💥 EXTREME SPECULATIVE", risk: "EXTREME", fortress_note: "SC-supervised restructuring. Land bank value is real. Process execution is uncertain.", quality_score: 28, is_active: true, megatrend: ["Real Estate"], market_cap_crores: 1500 },
    { id: "s-8", symbol: "RPOWER", name: "Reliance Power", sector: "Energy", industry: "Power Generation", current_price: 18, drop52w: -38, debt_to_equity: 3.2, roce_5yr_avg: 2.8, ocf: "2/5", moat: "Anil Ambani Group Power Assets", l1: 1, l2: 2, l3: 3, l4: 2, l5: 1, why_down: "Anil Ambani group debt defaults. Multiple fraud cases. Board credibility destroyed.", multi_bagger_case: "Power shortage in India is real. The underlying power plants DO generate electricity. If a credible strategic acquirer (like Adani Power or NTPC) acquires assets from insolvency, asset value could be realised. Price above ₹10 so borderline sub-20 but included.", killer_risk: "Promoter fraud cases are active. Even if assets are valuable, equity shareholders are last in queue during insolvency.", tag: "💥 EXTREME SPECULATIVE", risk: "EXTREME", fortress_note: "Anil Ambani group. Asset value exists but equity protection is near-zero without restructuring.", quality_score: 36, is_active: true, megatrend: ["Energy Transition"], market_cap_crores: 7200 },
];

export const v5TopMutualFunds: MutualFund[] = [
    { name: "Quant Small Cap Fund", amc: "Quant Mutual Fund", category: "Small Cap", cagr5y: 31.4, cagr3y: 28.2, aum: "₹24,800 Cr", minSIP: "₹1,000", risk: "Very High", why: "Best 5-year performer in small cap category. Contrarian valuation approach. High churn strategy — not for passive investors.", link: "https://www.quant.in" },
    { name: "Nippon India Small Cap", amc: "Nippon India MF", category: "Small Cap", cagr5y: 28.6, cagr3y: 24.8, aum: "₹56,200 Cr", minSIP: "₹100", risk: "Very High", why: "Largest small cap fund by AUM. Diversified across 100+ stocks. Good for long-term wealth creation via SIP." },
    { name: "HDFC Mid-Cap Opportunities", amc: "HDFC Mutual Fund", category: "Mid Cap", cagr5y: 24.2, cagr3y: 21.6, aum: "₹78,400 Cr", minSIP: "₹100", risk: "High", why: "Consistent outperformer. Large AUM provides stability. Good for core mid-cap allocation." },
    { name: "Parag Parikh Flexi Cap", amc: "PPFAS Mutual Fund", category: "Flexi Cap", cagr5y: 22.8, cagr3y: 19.4, aum: "₹82,100 Cr", minSIP: "₹1,000", risk: "Moderately High", why: "Owns Indian + US stocks (Google, Amazon, Meta). Best diversification across geographies. Conservative philosophy." },
    { name: "Mirae Asset Large & Midcap", amc: "Mirae Asset", category: "Large & Midcap", cagr5y: 20.6, cagr3y: 18.2, aum: "₹38,600 Cr", minSIP: "₹100", risk: "High", why: "Best risk-adjusted returns in large & midcap category. Korean AMC with disciplined process." },
    { name: "SBI Small Cap Fund", amc: "SBI Mutual Fund", category: "Small Cap", cagr5y: 23.4, cagr3y: 20.8, aum: "₹32,100 Cr", minSIP: "₹500", risk: "Very High", why: "Government-backed AMC with conservative small cap approach. Good for first-time small cap investors." },
];

export const v5TopIndexFunds: IndexFund[] = [
    { name: "UTI Nifty 50 Index Fund", category: "Large Cap Index", expense: "0.18%", tracks: "Nifty 50", cagr5y: 15.2, why: "Lowest cost way to own India's 50 largest companies. Beats 80%+ of actively managed large cap funds over 10 years." },
    { name: "Motilal Oswal Nifty Midcap 150 Index", category: "Mid Cap Index", expense: "0.28%", tracks: "Nifty Midcap 150", cagr5y: 19.4, why: "Best passive exposure to India's mid-cap growth story. No fund manager risk." },
    { name: "UTI Nifty Next 50 Index", category: "Large-Midcap Index", expense: "0.22%", tracks: "Nifty Next 50", cagr5y: 17.8, why: "Captures emerging large caps before they enter Nifty 50. Best 'next generation' passive play." },
];

export const v5TopFortressPicks: TopPick[] = [
    { symbol: "PAGEIND", name: "Page Industries", score: 80, tag: "HIGH CONVICTION DIP", roce: 62.4, de: 0.0, sector: "Consumer", why: "62% ROCE, zero debt. Jockey brand. Temporary inventory issue only." },
    { symbol: "PIDILITIND", name: "Pidilite Industries", score: 80, tag: "QUALITY ON SALE", roce: 29.6, de: 0.02, sector: "FMCG", why: "Fevicol is India's most powerful brand. 30% ROCE, near-zero debt." },
    { symbol: "MARICO", name: "Marico", score: 80, tag: "QUALITY ON SALE", roce: 38.2, de: 0.0, sector: "FMCG", why: "38% ROCE zero debt. Copra price cycle = temporary pain." },
    { symbol: "CUMMINSIND", name: "Cummins India", score: 80, tag: "QUALITY ON SALE", roce: 30.2, de: 0.0, sector: "Capital Goods", why: "30% ROCE, zero debt. Data centre boom = generator demand surge." },
    { symbol: "CLEANSCI", name: "Clean Science & Tech", score: 80, tag: "HIGH CONVICTION DIP", roce: 26.8, de: 0.0, sector: "Chemicals", why: "Patent-protected green chemistry. 40% cost advantage over peers." },
    { symbol: "HCLTECH", name: "HCL Technologies", score: 80, tag: "DEEP VALUE", roce: 26.4, de: 0.04, sector: "IT", why: "3.5% dividend yield. Cheapest Big-4 IT on India's best ROCE." },
    { symbol: "VINATIORGA", name: "Vinati Organics", score: 80, tag: "TRIGGER PLAY", roce: 22.4, de: 0.01, sector: "Chemicals", why: "One of 2 global ATBS producers. China price war is unsustainable." },
    { symbol: "ASIANPAINT", name: "Asian Paints", score: 80, tag: "QUALITY ON SALE", roce: 32.4, de: 0.0, sector: "FMCG", why: "55% market share. 32% ROCE zero debt. Birla threat overpriced." },
];

export const glossaryData: Glossary = {
    tags: [
        { name: "HIGH CONVICTION DIP", color: "#FFD700", emoji: "⭐", action: "BUY IN TRANCHES", plain: "A great company the market is temporarily scared of. Business is healthy — problem is short-term.", recommendation: "Buy in 2–3 instalments over 3–6 months. Fortress's highest-confidence category." },
        { name: "QUALITY ON SALE", color: "#4ADE80", emoji: "🛒", action: "BUY GRADUALLY", plain: "A brilliant company cheaper than normal. Like a Nike shoe on 30% sale — nothing wrong with the shoe.", recommendation: "Start buying now. Add over 6 months. Hold 3–5 years minimum." },
        { name: "DEEP VALUE", color: "#60A5FA", emoji: "💎", action: "BUY & HOLD", plain: "Market thinks this company will stop growing, but it keeps delivering quietly.", recommendation: "Buy and forget for 2–3 years. Collect dividends while you wait." },
        { name: "TRIGGER PLAY", color: "#A78BFA", emoji: "🎯", action: "WAIT FOR TRIGGER", plain: "Needs a specific event to recover — court case, FDA approval, rate cut. Good company, stuck waiting.", recommendation: "Only buy if you understand the trigger and believe it happens in 6–18 months." },
        { name: "TURNAROUND WATCH", color: "#FB923C", emoji: "🔄", action: "SMALL POSITION ONLY", plain: "Had problems but now fixing under new leadership. Like a hotel under new ownership.", recommendation: "5% of what you'd normally invest. Add only after 2 quarters of improved results." },
        { name: "PATIENT PICK", color: "#34D399", emoji: "⏳", action: "BUY & WAIT 12–18 MONTHS", plain: "Fine company, sector going through a slow patch. Plant it and wait.", recommendation: "Buy moderate position. Don't check price every day." },
        { name: "STRUCTURAL GROWTH", color: "#22D3EE", emoji: "📈", action: "BUY & COMPOUND", plain: "The entire industry is growing for 10–20 years. Company is a key player.", recommendation: "Buy and compound. Reinvest dividends. 5–10 year hold." },
        { name: "HIGH RISK RECOVERY", color: "#F87171", emoji: "⚠️", action: "SMALL BET ONLY", plain: "Something bad happened. Business still has value but trust is broken.", recommendation: "Maximum 2–3% of portfolio. Only if you can afford to lose it entirely." },
        { name: "⚠ FORTRESS AVOID", color: "#EF4444", emoji: "🚫", action: "DO NOT BUY", plain: "Cheap for a REASON. Business model broken or governance failed. Value trap.", recommendation: "Do not buy. Move on to better opportunities." },
        { name: "🎰 PENNY — QUALIFIED", color: "#E879F9", emoji: "🎰", action: "1% MAX PER STOCK", plain: "Passed quality filter but penny stocks are dangerous — low liquidity, easy manipulation.", recommendation: "Max 1% of portfolio per stock. Only money you can afford to lose entirely." },
        { name: "💥 EXTREME SPECULATIVE", color: "#FF4500", emoji: "💥", action: "LOTTERY TICKET ONLY", plain: "Below ₹10. High chance of zero, small chance of 5x–20x. These are not investments — they are calculated bets.", recommendation: "Max 0.5% of portfolio per stock. Treat as a lottery ticket. Do NOT average down." },
    ],
    riskLevels: [
        { level: "LOW", color: "#4ADE80", emoji: "🟢", plain: "Zero or very low debt, strong cash flows, survived multiple market crashes.", examples: "Asian Paints, Marico, Cummins India" },
        { level: "MEDIUM", color: "#FBBF24", emoji: "🟡", plain: "Some debt or temporary problem. Needs monitoring.", examples: "Wipro, Dr Reddy's, Axis Bank" },
        { level: "HIGH", color: "#F87171", emoji: "🔴", plain: "Something specific went wrong. Do not put money you need.", examples: "IndusInd Bank, Nykaa, HFCL" },
        { level: "VERY HIGH", color: "#EF4444", emoji: "🆘", plain: "Fundamental problems that may not be fixable.", examples: "Zee Entertainment" },
        { level: "EXTREME", color: "#DC2626", emoji: "☠️", plain: "Pure speculation. Could be worth zero tomorrow.", examples: "All Sub-₹20 stocks on this platform" },
    ],
    fortressLayers: [
        { layer: "L1 — Protection Filter", icon: "🛡", color: "#4ADE80", plain: "Is the company financially safe? D/E < 0.6, OCF positive 4/5 years, ROCE > 15%.", simple: "Do they have savings and no credit card debt?" },
        { layer: "L2 — Pricing Power", icon: "💪", color: "#60A5FA", plain: "Can this company raise prices without losing customers? Fevicol can. A commodity company cannot.", simple: "Can they charge more tomorrow and keep their customers?" },
        { layer: "L3 — Macro Tailwind", icon: "💨", color: "#A78BFA", plain: "Is India's big picture helping this company? Defence spending up = BEL benefits.", simple: "Is the wind blowing behind or against this company?" },
        { layer: "L4 — Growth Visibility", icon: "📊", color: "#FBBF24", plain: "Can we see revenue growing for next 3–5 years? Order books, pipeline, product launches.", simple: "Do they already know where next year's revenue comes from?" },
        { layer: "L5 — Governance Quality", icon: "🏛", color: "#FB923C", plain: "Is management honest and competent? Tata group = very high. Pledged shares or audit issues = low.", simple: "Would you trust this management with your wallet?" },
    ],
    updates: [
        { freq: "QUARTERLY", items: ["Fortress list rebalancing", "5-Layer score updates", "Why Box refreshes", "Penny + Sub-₹20 review"], color: "#4ADE80", why: "Quarterly = Driving School not Taxi Service.", next: "15 Jun 2026" },
        { freq: "MONTHLY", items: ["52W scanner refresh", "New IPO additions", "Sector rotation checks"], color: "#FBBF24", why: "Monthly catches structural changes without noise-trading.", next: "10 Apr 2026" },
        { freq: "EVENT-BASED", items: ["Earnings surprises", "FDA/SEBI decisions", "Management changes"], color: "#FB923C", why: "Some triggers need immediate attention.", next: "As needed" },
    ],
};
