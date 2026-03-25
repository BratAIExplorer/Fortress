# Frontend Components Codemap

**Last Updated:** March 25, 2026
**Focus:** V5 Extension & Fortress 30 UI with Live Scanner Integration

---

## Component Tree

```
app/
├── fortress-30/
│   └── page.tsx
│       ├── Fetches: getStocks() + getLiveF30Candidates(10)
│       ├── Renders: StockCard[] (curated)
│       └── Renders: ScannerCandidateCard[] (if candidates exist)
│
└── v5-extension/
    └── page.tsx
        ├── Fetches: getV5*Stocks() + getLive*Stocks() in parallel
        └── Renders: V5ExtensionTabs
            └── SplitStockGrid (for each tab)
                └── V5StockCard[] (mixed curated + live)

components/fortress/
├── V5ExtensionTabs.tsx
│   ├── Renders: TabsList (6 tabs)
│   ├── Renders: SplitStockGrid in each TabsContent
│   └── State: activeTab (string)
│
├── SplitStockGrid.tsx (internal, no export)
│   ├── Splits stocks by isLivePick
│   ├── Renders: "Curated" section (amber label)
│   ├── Renders: "Scanner Detected" section (emerald label)
│   └── Uses: V5StockCard
│
├── V5StockCard.tsx
│   ├── Displays: symbol, name, quality_score, current_price, drop52w
│   ├── Shows: "Live Scan" badge if isLivePick=true
│   ├── Shows: MB Score row if isLivePick + mbScore != null
│   ├── Shows: why_down, why_buy, multi_bagger_case (expandable on mobile)
│   ├── Shows: moat + tag at bottom
│   └── Interaction: hover lift, mobile tap toggle
│
├── ScannerCandidateCard.tsx (NEW)
│   ├── Displays: symbol, price, MB tier badge
│   ├── Shows: MB score, megatrend emoji + label
│   ├── Shows: total score, FCF yield %, debt direction icon
│   ├── Interaction: hover lift
│   └── Footer: "Scanner Detected · No Editorial Review"
│
└── Other (not modified in this update):
    ├── StockCard.tsx (Fortress 30 curated)
    ├── Navbar.tsx
    ├── RiskToggle.tsx
    └── ...
```

---

## Component Details

### V5ExtensionTabs.tsx

**Props:**
```typescript
interface V5ExtensionTabsProps {
  lowStocks: V5Stock[];
  pennyStocks: V5Stock[];
  subTenStocks: V5Stock[];
  topMF: MutualFund[];
  topIndex: IndexFund[];
  topPicks: TopPick[];
  glossary: Glossary;
}
```

**Tabs Definition:**
```typescript
[
  { id: "lows", label: "52W Lows", icon: TrendingDown, color: "data-[state=active]:bg-primary" },
  { id: "penny", label: "Qualified Penny", icon: Coins, color: "data-[state=active]:bg-primary" },
  { id: "speculative", label: "Sub-₹20 Spec", icon: Zap, color: "data-[state=active]:bg-primary" },
  { id: "picks", label: "Top Picks & MF", icon: Star, color: "..." },
  { id: "scanner", label: "Intelligent Scanner", icon: Search, color: "..." },
  { id: "glossary", label: "Glossary", icon: Info, color: "..." },
]
```

**Key Features:**
- Tab switching via `useState("lows")`
- `SplitStockGrid` for stock tabs (lows, penny, speculative)
- V5TopPicks for "picks" tab
- V5MarketScanner for "scanner" tab
- V5Glossary for "glossary" tab

---

### SplitStockGrid Component (Internal)

**Props:**
```typescript
function SplitStockGrid({ stocks }: { stocks: V5Stock[] })
```

**Logic:**
```typescript
const curated = stocks.filter(s => !s.isLivePick);
const live = stocks.filter(s => s.isLivePick);
```

**Layout:**
```
[Curated header]
─────────────────────────────
Curated    [────────────────────]  {curated.length} picks
[V5StockCard] [V5StockCard] ...    (grid: md:2col, lg:3col, xl:4col)

[Live header]
─────────────────────────────
Scanner Detected    [────────────]  {live.length} new picks
Auto-detected by the live scanner. No editorial review yet.
[V5StockCard] [V5StockCard] ...    (same grid)
```

**Styling:**
- Curated label: `text-amber-500` (amber)
- Live label: `text-emerald-400` (emerald)
- Separator: `h-px bg-white/10` (divider line)
- Empty state: "No stocks found. Run a scan to populate this list."

---

### V5StockCard Component

**Props:**
```typescript
export function V5StockCard({ stock }: { stock: V5Stock })
```

**Layout:**
```
┌────────────────────────────────────┐
│ [Symbol]  [green badge if live]    │
│ [Name]              [QS: {score}]  │
│                     [OCF: {ocf}]    │
│                                     │
│ CMP: ₹{price}     52W Drop: {%}    │
│ [─────────────────────────────]    │
│                                     │
│ (live only) [MB Score row]          │
│                                     │
│ ┌─ Why It Fell ──────────────────┐ │
│ │ "{why_down}"                   │ │
│ └────────────────────────────────┘ │
│ ┌─ Fortress View ────────────────┐ │
│ │ {why_buy}                      │ │
│ └────────────────────────────────┘ │
│ ┌─ Multi-Bagger Case ────────────┐ │
│ │ {multi_bagger_case}            │ │
│ └────────────────────────────────┘ │
│                                     │
│ [{moat}]                    {tag}  │
└────────────────────────────────────┘
```

**Live Pick Badge:**
```typescript
{stock.isLivePick && (
  <Badge className="font-mono text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 gap-1">
    <RadioTower className="h-2.5 w-2.5" /> Live Scan
  </Badge>
)}
```

**MB Score Row (live only):**
```typescript
{stock.isLivePick && stock.mbScore != null && (
  <div className="flex items-center justify-between text-[10px] border border-emerald-500/20 bg-emerald-500/5 rounded-sm px-2 py-1.5">
    <span className="text-muted-foreground uppercase tracking-wide">MB Score</span>
    <span className="font-bold text-emerald-400">{stock.mbScore} · {stock.mbTier}</span>
  </div>
)}
```

**Drop52w Display:**
```typescript
{stock.drop52w ? `${stock.drop52w}%` : "–"}  // Shows "–" instead of "0%"
```

**State:**
- `showDetail` (boolean) — toggles detail expansion on mobile

**Interaction:**
- Desktop: hover to show details (via group-hover)
- Mobile: tap to toggle details via ChevronDown/ChevronUp indicator
- Hover effect: `group-hover:text-primary`
- Card lift: `whileHover={{ y: -5 }}`

---

### ScannerCandidateCard Component (NEW)

**Props:**
```typescript
export function ScannerCandidateCard({ candidate }: { candidate: ScannerCandidate })
```

**Type Reference:**
```typescript
interface ScannerCandidate {
  id: string;
  symbol: string;
  price: number;
  mbScore: number;
  mbTier: string;                    // 'Rocket' | 'Launcher' | 'Builder' | 'Crawler' | 'Grounded'
  totalScore: number;
  megatrend: string;
  megatrendEmoji: string;
  fcfYieldPct: number | null;
  deDirection: string | null;        // 'falling' | 'rising'
  marginDirection: string | null;    // 'expanding' | 'contracting'
}
```

**Layout:**
```
┌────────────────────────────────────┐
│ [RadioTower] [Symbol]   [MB tier]  │
│              [Price]     [MB score] │
│                                     │
│ [Megatrend emoji] Megatrend label  │
│                                     │
│ Score: {total}                      │
│ FCF Yld: {pct}%  Debt: [icon]      │
│                                     │
│ Scanner Detected · No Editorial    │
│ Review                             │
└────────────────────────────────────┘
```

**Tier Color Mapping:**
```typescript
const TIER_COLORS: Record<string, string> = {
  Rocket:    "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
  Launcher:  "text-blue-400 border-blue-500/40 bg-blue-500/10",
  Builder:   "text-amber-400 border-amber-500/40 bg-amber-500/10",
  Crawler:   "text-orange-400 border-orange-500/40 bg-orange-500/10",
  Grounded:  "text-red-400 border-red-500/40 bg-red-500/10",
};
```

**Direction Icons:**
- falling / expanding → TrendingDown (emerald) — good signs
- rising / contracting → TrendingUp (red) — warning signs
- null → Minus (gray) — unknown

**Footer:**
- "Scanner Detected · No Editorial Review" — always visible
- Color: `text-emerald-500/60` (muted emerald)

**Styling:**
- Card border: `border-emerald-500/20` (green accent)
- Hover effect: `whileHover={{ y: -4 }}`
- Backdrop: `bg-card/50 backdrop-blur`

---

## Data Mapping (scan_results → ScannerCandidate)

```typescript
// In getLiveF30Candidates(limit):
results.map(r => ({
  id: r.id,
  symbol: r.symbol,
  price: Number(r.priceAtScan) || 0,
  mbScore: r.mbScore ?? 0,
  mbTier: r.mbTier ?? "–",
  totalScore: r.totalScore ?? 0,
  megatrend: r.megatrendTag ?? "",
  megatrendEmoji: r.megatrendEmoji ?? "",
  fcfYieldPct: r.fcfYieldPct != null ? Number(r.fcfYieldPct) : null,
  deDirection: r.deDirection ?? null,
  marginDirection: r.marginDirection ?? null,
}))
```

---

## Data Mapping (scan_results → V5Stock for live picks)

```typescript
// In getLiveScanStocksByCategory(category):
results.map(r => ({
  id: r.id,
  symbol: r.symbol,
  name: r.symbol,                    // Use symbol as name (fallback)
  sector: r.megatrendTag || "Scanner Pick",
  current_price: Number(r.priceAtScan) || 0,
  quality_score: r.totalScore || 0,
  market_cap_crores: 0,
  megatrend: r.megatrendTag ? [r.megatrendTag] : [],
  is_active: true,
  tag: r.mbTier || "SCANNER",
  risk: "HIGH",
  drop52w: 0,                         // Scanner data lacks 52w history
  moat: r.megatrendTag || "Scanner Pick",
  ocf: "–",
  l1: r.l1Pass ? 1 : 0,               // Binary: 1 if passed, 0 if failed
  l2: r.l2Pass ? 1 : 0,
  l3: r.l3Pass ? 1 : 0,
  l4: r.l4Pass ? 1 : 0,
  l5: r.l5Pass ? 1 : 0,
  mbScore: r.mbScore ?? undefined,
  mbTier: r.mbTier ?? undefined,
  isLivePick: true,                  // **KEY FLAG**
}))
```

---

## Responsive Breakpoints

All components follow Tailwind breakpoints:

| Breakpoint | Screen | Grid Cols |
|------------|--------|-----------|
| (none)     | xs (<640px) | 1 |
| md         | ≥768px | 2 |
| lg         | ≥1024px | 3 |
| xl         | ≥1280px | 4 |

**SplitStockGrid:**
```typescript
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
```

**Fortress 30 Candidates:**
```typescript
className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
```

Mobile detail toggle on V5StockCard:
```typescript
<div className="flex md:hidden items-center justify-center py-1">
  {/* Mobile only */}
</div>
```

---

## Testing Scenarios

### V5 Extension Tabs
- [ ] Load /v5-extension with no data — show mock data
- [ ] Load with DB curated + scan results live — merge correctly
- [ ] Switch tabs — each shows correct merged stocks
- [ ] Curated section always shows first (amber label)
- [ ] Live section below curated (emerald label)
- [ ] No duplicate symbols in merged list
- [ ] Green badge appears only for live picks
- [ ] MB Score row appears only for live picks
- [ ] drop52w shows "–" for live picks (where value is 0 or missing)
- [ ] Mobile: tap toggle shows/hides details

### Fortress 30 + Scanner Candidates
- [ ] Load /fortress-30 with curated stocks only — no candidates section
- [ ] Load with candidates — candidates section visible
- [ ] Candidates section title + description visible
- [ ] ScannerCandidateCard renders all fields without errors
- [ ] MB tier color-codes correctly (Rocket=emerald, Launcher=blue, etc.)
- [ ] Direction icons show correct symbols (↓ for falling, ↑ for rising, – for null)
- [ ] FCF yield displays "–" if null
- [ ] Candidates excluded from curated stocks list
- [ ] Max 10 candidates displayed

---

## Import Statements

```typescript
// In V5ExtensionTabs.tsx
import { useState } from "react";
import type { V5Stock, TopPick, MutualFund, IndexFund, Glossary } from "@/lib/types";
import { V5StockCard } from "@/components/fortress/V5StockCard";
import { V5TopPicks } from "@/components/fortress/V5TopPicks";
import { V5Glossary } from "@/components/fortress/V5Glossary";
import { V5MarketScanner } from "@/components/fortress/V5MarketScanner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingDown, Coins, Zap, Star, Info, Search } from "lucide-react";
import { cn } from "@/lib/utils";

// In ScannerCandidateCard.tsx
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RadioTower, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { ScannerCandidate } from "@/lib/types";
import { cn } from "@/lib/utils";

// In V5StockCard.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingDown, Target, Zap, ChevronDown, ChevronUp, RadioTower } from "lucide-react";
import { V5Stock } from "@/lib/types";
import { cn } from "@/lib/utils";
```

---

## Related Files

- `app/v5-extension/page.tsx` — V5 Extension page (fetches data)
- `app/fortress-30/page.tsx` — Fortress 30 page (fetches curated + candidates)
- `app/actions.ts` — Server actions for data fetching
- `lib/types.ts` — Type definitions (V5Stock, ScannerCandidate)
- `lib/mock-data.ts` — Fallback data for V5 stocks
