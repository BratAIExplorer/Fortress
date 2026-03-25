"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/fortress/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield, Zap, TrendingUp, BookOpen, Brain, Target, AlertTriangle,
  ChevronDown, ChevronUp, ExternalLink, CheckCircle, XCircle,
  BarChart2, Users, Lock, Globe, Cpu, Star, Info
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Mode = "beginner" | "expert";

interface SectionProps { mode: Mode }

// ─── Shared helpers ───────────────────────────────────────────────────────────

function SectionTitle({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      {icon && <div className="text-primary">{icon}</div>}
      <h2 className="text-2xl sm:text-3xl font-bold font-serif">{children}</h2>
    </div>
  );
}

function BeginnerBadge() {
  return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">Plain English</Badge>;
}
function ExpertBadge() {
  return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">Technical Detail</Badge>;
}

function Callout({ emoji, title, children, color = "amber" }: {
  emoji: string; title: string; children: React.ReactNode; color?: string;
}) {
  const colors: Record<string, string> = {
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-200",
    green: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    red: "border-red-500/30 bg-red-500/10 text-red-200",
    purple: "border-purple-500/30 bg-purple-500/10 text-purple-200",
  };
  return (
    <div className={cn("rounded-xl border p-4 flex gap-3", colors[color])}>
      <span className="text-2xl shrink-0">{emoji}</span>
      <div>
        <p className="font-bold text-sm mb-1">{title}</p>
        <p className="text-sm leading-relaxed opacity-90">{children}</p>
      </div>
    </div>
  );
}

function Accordion({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-medium text-sm">{question}</span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-white/10 pt-3">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Section 1: What is Fortress ─────────────────────────────────────────────

function WhatIsFortress({ mode }: SectionProps) {
  return (
    <section id="what-is-fortress" className="scroll-mt-20">
      <SectionTitle icon={<Shield className="h-7 w-7" />}>What is Fortress Intelligence?</SectionTitle>

      {mode === "beginner" ? (
        <div className="space-y-5">
          <BeginnerBadge />
          <p className="text-lg text-muted-foreground leading-relaxed mt-3">
            Imagine you want to buy a phone but you don&apos;t know which one is actually good vs which one just has a nice ad. Fortress is like having a very experienced engineer friend who looks inside every phone and tells you honestly — <strong className="text-white">this one is built to last, this one will break in 6 months.</strong>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Instead of phones, we do this for companies listed on the stock market. We run every company through a <strong className="text-white">6-layer quality engine</strong>, give them a score out of 100, and flag the ones that actually deserve your attention — not the ones with the loudest news.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            {[
              { emoji: "🚫", title: "Not a tip service", desc: "We never say 'BUY THIS NOW'. We explain WHY a company passed our quality checks." },
              { emoji: "📚", title: "Education first", desc: "Every stock in our list comes with a plain-English explanation you can actually understand." },
              { emoji: "🛡️", title: "Honest filters", desc: "Our scoring is automatic and rules-based. No one gets paid to promote a stock." },
            ].map(c => (
              <Card key={c.title} className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="text-3xl mb-2">{c.emoji}</div>
                  <p className="font-bold text-sm mb-1">{c.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <ExpertBadge />
          <p className="text-muted-foreground leading-relaxed mt-3">
            Fortress Intelligence is a rules-based stock intelligence platform built for NRI and Indian long-term investors. It combines a <strong className="text-white">quantitative 6-layer scoring engine v2</strong> (Python, yfinance), a <strong className="text-white">4-criteria GEM Score system</strong> (AI-assisted discovery), and a <strong className="text-white">self-learning performance tracker</strong> (Sovereign Alpha) that measures prediction accuracy vs Nifty 50 at 30/90/180-day intervals.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Markets covered: <strong className="text-white">NSE (India), NYSE/NASDAQ (US), HKEX (Hong Kong)</strong>. The system is not SEBI-registered and makes no investment recommendations — it publishes frameworks and scored data for educational use.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Markets", value: "3 (NSE, US, HKEX)" },
              { label: "Scoring Layers", value: "6 fully automated" },
              { label: "GEM Criteria", value: "4 (dynamic weights)" },
              { label: "Tracking cycles", value: "30d / 90d / 180d / 1yr" },
            ].map(s => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                <p className="font-bold text-sm text-primary">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Section 2: The 6-Layer Engine ───────────────────────────────────────────

const layers = [
  {
    id: "L1",
    icon: "🛡️",
    color: "#4ADE80",
    label: "L1 — Protection",
    beginner: {
      question: "Is this company financially safe?",
      analogy: "Think of it like checking if someone has savings and no credit card debt before lending them money — AND checking whether their debt is going up or coming down every year.",
      whatWeCheck: [
        "Does the company owe more than it earns? (Debt check)",
        "Does it actually generate real cash, not just accounting profit?",
        "Is it earning a good return on the money invested in it?",
        "What percentage of its profit actually becomes real cash in hand?",
        "Is the company's debt growing or shrinking year-on-year? (3-year direction)",
      ],
      passExample: "Asian Paints, Pidilite — zero or very low debt, consistent cash generation, debt falling every year.",
      failExample: "A real estate developer with 5x debt-to-equity, negative cash flow, and debt rising for 3 years.",
    },
    expert: {
      metrics: [
        { name: "Debt/Equity (D/E)", threshold: "< 0.6 full pts | 0.6–1.0 half pts | > 1.0 zero", note: "NSE raw values divided by 100 for normalisation" },
        { name: "ROCE", threshold: "> 15% full pts | 10–15% half pts", note: "Return on Capital Employed" },
        { name: "Operating Cash Flow", threshold: "Positive = pass (binary)", note: "" },
        { name: "FCF Yield", threshold: "> 5% full | 2–5% half", note: "freeCashflow ÷ marketCap" },
        { name: "Earnings Quality", threshold: "> 0.8 full | 0.5–0.8 half", note: "freeCashflow ÷ netIncomeToCommon" },
        { name: "Debt Trajectory (v3)", threshold: "Falling 3yr = full bonus | Falling partial = half | Stable = small | Rising = zero", note: "3yr D/E direction from balance_sheet — direction matters more than snapshot" },
      ],
      maxPts: 25,
      weight: "22% D/E | 26% ROCE | 12% OCF | 18% FCF Yield | 12% Earnings Quality | 10% Debt Trajectory",
    },
  },
  {
    id: "L2",
    icon: "💪",
    color: "#60A5FA",
    label: "L2 — Pricing Power",
    beginner: {
      question: "Can this company charge more tomorrow and keep its customers?",
      analogy: "Fevicol can raise prices — there's no real alternative. A rice seller cannot — you'll just buy from the next stall. But we now also check: is Fevicol's margin better than other adhesive companies? That's real pricing power.",
      whatWeCheck: [
        "How much profit does it make on every ₹100 of sales? (Gross margin — absolute)",
        "After all expenses, how much is left? (Operating margin — absolute)",
        "Are its margins above the sector average? (Sector-relative premium — new in v2)",
      ],
      passExample: "Nestle — 55%+ gross margins, well above the FMCG sector median of 38%. Genuine pricing power.",
      failExample: "A steel company at 18% gross margin — below sector median. Price is set by global commodity markets.",
    },
    expert: {
      metrics: [
        { name: "Gross Margin (absolute)", threshold: "> 40% full | 25–40% × 0.6 | 15–25% × 0.3", note: "grossMargins from yfinance" },
        { name: "Operating Margin (absolute)", threshold: "> 20% full | 12–20% × 0.6 | 6–12% × 0.3", note: "operatingMargins from yfinance" },
        { name: "Sector-Relative Premium (new)", threshold: "> 30% above sector full | 10–30% × 0.6 | > 0% × 0.3", note: "Gross margin vs SECTOR_GM_MEDIAN lookup. Banks/NBFCs use operating margin instead" },
      ],
      maxPts: 20,
      weight: "40% Gross Margin | 35% Operating Margin | 25% Sector-Relative Premium",
    },
  },
  {
    id: "L3",
    icon: "💨",
    color: "#A78BFA",
    label: "L3 — Relative Strength",
    beginner: {
      question: "Is the market consistently rewarding this stock across multiple timeframes?",
      analogy: "One good month could be luck. Beating the Nifty 50 for 3 months, 6 months AND a year is a structural trend. L3 v2 now checks all three — a stock that outperforms consistently across all timeframes is in a genuine uptrend.",
      whatWeCheck: [
        "Has the stock outperformed Nifty 50 over 3 months? (40% weight)",
        "Has it outperformed over 6 months? (35% weight)",
        "Has it outperformed over 1 full year? (25% weight)",
      ],
      passExample: "A defence stock that has beaten Nifty 50 for 3M, 6M, and 1Y — structural institutional accumulation.",
      failExample: "A stock that spiked 20% in one month but is flat/negative over 6M and 1Y — a noise spike, not a trend.",
    },
    expert: {
      metrics: [
        { name: "3M Relative Return (40%)", threshold: "> bench×1.1 = full | > bench = 2/3 | > 0 = 1/3 | ≤ 0 = zero", note: "63 trading days" },
        { name: "6M Relative Return (35%)", threshold: "> bench×1.1 = full | > bench = 2/3 | > 0 = 1/3 | ≤ 0 = zero", note: "126 trading days" },
        { name: "1Y Relative Return (25%)", threshold: "> bench×1.1 = full | > bench = 2/3 | > 0 = 1/3 | ≤ 0 = zero", note: "252 trading days" },
      ],
      maxPts: 10,
      weight: "40% 3M momentum | 35% 6M momentum | 25% 1Y momentum — all vs market benchmark",
    },
  },
  {
    id: "L4",
    icon: "📊",
    color: "#FBBF24",
    label: "L4 — Growth Visibility",
    beginner: {
      question: "Can we already see where next year's revenue is coming from?",
      analogy: "A company with a 2-year order book already knows what it will earn. A restaurant with no reservations does not. L4 checks how visible and real the growth is — and whether you're paying a fair price for it.",
      whatWeCheck: [
        "Is revenue growing faster than 10–15% per year?",
        "Is profit growing faster than 10–15% per year?",
        "Are you paying a reasonable price for that growth? (PEG ratio)",
      ],
      passExample: "A defence company with 2-year order book + 20% revenue growth at PEG of 0.9.",
      failExample: "A company growing 30% BUT trading at 100x P/E — growth is already fully priced in. PEG > 3.",
    },
    expert: {
      metrics: [
        { name: "Revenue Growth", threshold: "> 15% full | 10–15% half", note: "revenueGrowth from yfinance" },
        { name: "Earnings Growth", threshold: "> 15% full | 10–15% half", note: "earningsGrowth from yfinance" },
        { name: "PEG Ratio (NEW)", threshold: "< 0.8 full | 0.8–1.2 = 2/3 | 1.2–2.0 = 1/3 | > 2.0 = zero", note: "trailingPE ÷ (earningsGrowth × 100)" },
      ],
      maxPts: 25,
      weight: "35% Revenue Growth | 35% Earnings Growth | 30% PEG Ratio",
    },
  },
  {
    id: "L5",
    icon: "🏛️",
    color: "#FB923C",
    label: "L5 — Governance & Ownership",
    beginner: {
      question: "Are the right people owning — and watching — this company?",
      analogy: "Imagine you're investing in a business with a partner. You'd want to know: does the founder have most of their own money in it? Are respected investors backing it? Is anyone actively betting against it? That's what L5 checks — rebuilt with real data in v2.",
      whatWeCheck: [
        "Does the promoter/founder own 35–50%+ of the company? (Skin in the game)",
        "Are FII/DII institutions invested? (Smart money validation — they do deep research)",
        "Is anyone actively shorting the stock? (Professional short sellers = red flag)",
        "Is management's debt trajectory responsible? (Capital discipline signal)",
      ],
      passExample: "A founder-led company with 55% promoter holding, 20% FII holding, and low short interest — maximum alignment.",
      failExample: "A company where promoters hold 8%, FII has been exiting, and short ratio is 8+ — smart money is leaving.",
    },
    expert: {
      metrics: [
        { name: "Insider/Promoter Holding (35%)", threshold: "≥ 50% full | 35–50% × 0.63 | 20–35% × 0.34", note: "heldPercentInsiders from yfinance" },
        { name: "Institutional/FII Holding (27%)", threshold: "≥ 25% full | 12–25% × 0.63 | 5–12% × 0.30", note: "heldPercentInstitutions from yfinance" },
        { name: "Short Interest Guard (20%)", threshold: "shortRatio < 2 = full | 2–5 = half | > 5 = zero", note: "Partial credit given if data unavailable (Indian stocks)" },
        { name: "Debt Trajectory (18%)", threshold: "D/E falling = full | stable = half | rising = zero", note: "3-year direction from balance sheet" },
      ],
      maxPts: 15,
      weight: "35% Promoter Holding | 27% Institutional Conviction | 20% Short Guard | 18% Debt Trajectory",
    },
  },
  {
    id: "L6",
    icon: "🔍",
    color: "#94A3B8",
    label: "L6 — Valuation Gate",
    beginner: {
      question: "Is this stock priced at insane levels with nothing to justify it?",
      analogy: "Paying ₹10,000 for a samosa is not investing — it's a bubble. But paying ₹200 for a samosa from a famous cart with a 2-hour queue? That's justified premium. L6 only catches the ₹10,000 samosas.",
      whatWeCheck: [
        "Is the P/E ratio above 100 with earnings growth below 25%? (Bubble check)",
        "Is EV/EBITDA above 60 with low growth? (Enterprise value sanity check)",
        "Note: High-quality growth stocks at 30–60x P/E are NOT penalised here",
      ],
      passExample: "A pharma stock at 45x P/E with 28% earnings growth — high multiple, but growth justifies it. Full marks.",
      failExample: "A mid-cap at 180x P/E growing at 4% — P/E bubble with no growth to justify it. Hard zero.",
    },
    expert: {
      metrics: [
        { name: "Bubble Disqualifier", threshold: "PE > 100 AND earningsGrowth < 25% → hard zero | EV/EBITDA > 60 AND growth < 20% → hard zero", note: "Returns 0 — can drop a stock below 60 threshold" },
        { name: "PE ≤ 30", threshold: "Full 5 pts", note: "Value / reasonable growth" },
        { name: "PE 31–50", threshold: "4 pts (×0.8)", note: "Growth territory — fair" },
        { name: "PE 51–80", threshold: "2.5 pts (×0.5)", note: "Premium growth — half points" },
        { name: "PE 81–100", threshold: "1 pt (×0.2)", note: "Near-bubble zone" },
        { name: "No PE (loss-making)", threshold: "P/S < 15 → 3 pts | else 2.5 pts", note: "Pre-profitability companies" },
      ],
      maxPts: 5,
      weight: "Valuation sanity gate — not a value investing filter. Quality growth at 40–60x still scores well.",
    },
  },
];

function FiveLayerEngine({ mode }: SectionProps) {
  const [expanded, setExpanded] = useState<string | null>("L1");

  return (
    <section id="five-layers" className="scroll-mt-20">
      <SectionTitle icon={<Cpu className="h-7 w-7" />}>The 6-Layer Scoring Engine v2</SectionTitle>

      {mode === "beginner" ? (
        <div className="mb-6 space-y-4">
          <BeginnerBadge />
          <p className="text-muted-foreground leading-relaxed mt-3">
            Every company we scan gets put through <strong className="text-white">6 questions</strong>. Each question is worth points. A company needs at least <strong className="text-white">60 out of 100</strong> to even show up on our radar. Click each layer to see what we&apos;re actually checking.
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "L1", pts: "25pts", color: "#4ADE80" }, { id: "L2", pts: "20pts", color: "#60A5FA" },
              { id: "L3", pts: "10pts", color: "#A78BFA" }, { id: "L4", pts: "25pts", color: "#FBBF24" },
              { id: "L5", pts: "15pts", color: "#FB923C" }, { id: "L6", pts: "5pts", color: "#94A3B8" },
            ].map(l => (
              <span key={l.id} className="text-xs px-2 py-1 rounded-full border border-white/10 bg-white/5" style={{ color: l.color }}>
                {l.id} · {l.pts}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-6 space-y-3">
          <ExpertBadge />
          <p className="text-muted-foreground leading-relaxed mt-3">
            Engine v2 — Python, yfinance data, 6 automated layers. New: L2 sector-relative margins, L3 multi-band momentum (3M+6M+1Y), L5 ownership quality (promoter/FII data), L6 valuation bubble gate. Default weights: L1:25 + L2:20 + L3:10 + L4:25 + L5:15 + L6:5 = 100. Stocks scoring ≥ 60 are classified; below 60 marked <code className="text-xs bg-white/10 px-1 rounded">OFFLINE</code>. ThreadPoolExecutor, 5 workers, batch 20, 1Y history fetch.
          </p>
        </div>
      )}

      {/* Score bar */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {layers.map(l => (
          <div key={l.id} className="flex items-center gap-1 text-xs">
            <span className="font-mono font-bold" style={{ color: l.color }}>{l.id}</span>
            <span className="text-muted-foreground">{mode === "expert" ? `${l.expert.maxPts}pts` : ""}</span>
          </div>
        ))}
        <div className="ml-auto text-xs text-muted-foreground">Pass threshold: <strong className="text-white">60 / 100</strong></div>
      </div>

      <div className="space-y-3">
        {layers.map(layer => (
          <div
            key={layer.id}
            className="border border-white/10 rounded-xl overflow-hidden"
            style={{ borderLeftColor: layer.color, borderLeftWidth: 3 }}
          >
            <button
              onClick={() => setExpanded(expanded === layer.id ? null : layer.id)}
              className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors text-left"
            >
              <span className="text-2xl">{layer.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm" style={{ color: layer.color }}>{layer.label}</span>
                  {mode === "expert" && (
                    <Badge className="text-[10px] bg-white/10 border-0">{layer.expert.maxPts} pts</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {mode === "beginner" ? layer.beginner.question : layer.expert.weight}
                </p>
              </div>
              {expanded === layer.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>

            <AnimatePresence>
              {expanded === layer.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-4 pb-5 border-t border-white/10 pt-4 space-y-4">
                    {mode === "beginner" ? (
                      <>
                        <Callout emoji="💡" title="The analogy" color="blue">
                          {layer.beginner.analogy}
                        </Callout>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">What we actually check</p>
                          <ul className="space-y-1">
                            {layer.beginner.whatWeCheck.map(c => (
                              <li key={c} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                            <p className="text-xs font-bold text-emerald-400 mb-1">PASSES this layer</p>
                            <p className="text-xs text-muted-foreground">{layer.beginner.passExample}</p>
                          </div>
                          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                            <p className="text-xs font-bold text-red-400 mb-1">FAILS this layer</p>
                            <p className="text-xs text-muted-foreground">{layer.beginner.failExample}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-white/10">
                                <th className="text-left text-muted-foreground py-2 pr-4 font-medium">Metric</th>
                                <th className="text-left text-muted-foreground py-2 pr-4 font-medium">Thresholds</th>
                                <th className="text-left text-muted-foreground py-2 font-medium">Notes</th>
                              </tr>
                            </thead>
                            <tbody>
                              {layer.expert.metrics.map(m => (
                                <tr key={m.name} className="border-b border-white/5">
                                  <td className="py-2 pr-4 font-mono text-primary font-medium">{m.name}</td>
                                  <td className="py-2 pr-4 text-muted-foreground">{m.threshold}</td>
                                  <td className="py-2 text-muted-foreground italic">{m.note}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="text-xs text-muted-foreground bg-white/5 rounded-lg p-3">
                          <strong className="text-white">Weight distribution:</strong> {layer.expert.weight}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Section 3: GEM Score ─────────────────────────────────────────────────────

const gemTiers = [
  { tier: "Diamond", emoji: "💎", color: "#60A5FA", range: "80–100", beginner: "A company that is genuinely great, genuinely undervalued, AND showing early signs that others are starting to notice. These are rare. 2–5 per full scan.", expert: "All 4 GEM criteria fire simultaneously. Institutional blindspot present. Momentum divergence confirmed. Target: 3x–10x opportunity." },
  { tier: "Sapphire", emoji: "🔷", color: "#818CF8", range: "60–79", beginner: "Very good. Missing one piece of the puzzle. Still worth serious research. Most reliable category for steady returns.", expert: "3/4 criteria strong. One signal weak or timing not yet aligned. Bread-and-butter picks. 5–15 per scan expected." },
  { tier: "Emerald", emoji: "💚", color: "#34D399", range: "40–59", beginner: "Interesting but needs a trigger — a specific event — before it becomes a buy. Put it on a watchlist.", expert: "Fundamental strength present but catalyst not yet visible. Monitor quarterly. Emerald → Sapphire upgrade is a buy signal." },
  { tier: "Quartz", emoji: "🟡", color: "#F59E0B", range: "20–39", beginner: "Speculative. Only for money you are 100% okay losing. Like a small bet at a poker table.", expert: "Single-criterion trigger only. High momentum or extreme undervaluation without fundamental support. Aggressive mode only. Hard stop-loss -8%." },
];

const gemCriteria = [
  { name: "Valuation Edge", icon: "⚖️", weight: 30, color: "#F59E0B", beginner: "Is the stock cheaper than it should be? Not just in absolute terms, but compared to similar companies in the same industry.", expert: "P/E vs sector median, P/B < 1.5, EV/EBITDA vs peers, PEG < 1.2. Sector-relative valuation prevents false positives from distressed sectors.", redFlags: ["PE low due to one-time gain", "EV/EBITDA low because of high debt masking real leverage"] },
  { name: "Institutional Blindspot", icon: "🔍", weight: 25, color: "#6366F1", beginner: "Is this company being ignored by big fund managers? When they finally notice it, they'll all buy at once — and you'll already be in.", expert: "Institutional ownership < 15%, analyst coverage < 3 firms. Low coverage = discovery gap. When institutions accumulate, price re-rates sharply.", redFlags: ["Low coverage because company refuses transparency", "No institutions because business is structurally broken"] },
  { name: "Fundamental Strength", icon: "🏗️", weight: 25, color: "#10B981", beginner: "Is the business actually healthy underneath? Revenue growing, profits real, no hidden debt bomb.", expert: "Revenue growth > 15% YoY, ROE > 15%, D/E < 1.0, positive FCF, operating margins stable or improving. FCF/Net Income > 0.8 (earnings quality check).", redFlags: ["Revenue declining 2+ consecutive years", "Negative operating cash flow", "Debt growing faster than revenue"] },
  { name: "Momentum Divergence", icon: "⚡", weight: 20, color: "#F97316", beginner: "The business is doing great but the stock price hasn't caught up yet. Someone is quietly buying before the crowd arrives.", expert: "Strong fundamentals + price flat/down 6+ months. Volume spikes without news. Insider buying in open market. Promoter increasing stake quietly.", redFlags: ["Price already surging — gem may be discovered and priced in", "Volume spike on negative news (distribution, not accumulation)"] },
];

function GemScore({ mode }: SectionProps) {
  const [active, setActive] = useState(0);

  return (
    <section id="gem-score" className="scroll-mt-20">
      <SectionTitle icon={<Star className="h-7 w-7" />}>The GEM Score System</SectionTitle>

      {mode === "beginner" ? (
        <div className="mb-6">
          <BeginnerBadge />
          <p className="text-muted-foreground leading-relaxed mt-3">
            The 5-layer engine tells you if a company is <em>financially safe</em>. The GEM Score asks a different question: is this a <strong className="text-white">hidden opportunity</strong> — something genuinely good that the market hasn&apos;t noticed yet? It scores 0–100 across 4 criteria and assigns a tier (Diamond down to Quartz).
          </p>
        </div>
      ) : (
        <div className="mb-6">
          <ExpertBadge />
          <p className="text-muted-foreground leading-relaxed mt-3">
            The GEM Score is AI-assisted (Claude-powered), running 4 weighted criteria with dynamic weights that adjust based on the Sovereign Alpha learning engine. Default weights: Valuation 30, Institutional Blindspot 25, Fundamental Strength 25, Momentum Divergence 20. Weights shift based on 90-day hit rate analysis per criterion.
          </p>
        </div>
      )}

      {/* Tiers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {gemTiers.map(t => (
          <Card key={t.tier} className="bg-white/5 border-white/10 text-center">
            <CardContent className="p-4">
              <div className="text-3xl mb-2">{t.emoji}</div>
              <p className="font-bold text-sm" style={{ color: t.color }}>{t.tier}</p>
              <p className="text-xs text-muted-foreground">{t.range} pts</p>
              <p className="text-[11px] text-muted-foreground mt-2 leading-tight">
                {mode === "beginner" ? t.beginner : t.expert}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Criteria */}
      <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-4">The 4 Criteria</p>
      <div className="flex gap-2 mb-4 flex-wrap">
        {gemCriteria.map((c, i) => (
          <button
            key={c.name}
            onClick={() => setActive(i)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full border transition-all",
              active === i ? "border-primary text-white bg-primary/20" : "border-white/20 text-muted-foreground hover:border-white/40"
            )}
          >
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{gemCriteria[active].icon}</span>
                  <span className="font-bold" style={{ color: gemCriteria[active].color }}>{gemCriteria[active].name}</span>
                </div>
                <Badge className="bg-white/10 border-0 text-xs">{gemCriteria[active].weight} pts weight</Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {mode === "beginner" ? gemCriteria[active].beginner : gemCriteria[active].expert}
              </p>
              <div>
                <p className="text-xs font-bold text-red-400 mb-2 uppercase tracking-wide">Red flags that disqualify this criterion</p>
                <ul className="space-y-1">
                  {gemCriteria[active].redFlags.map(rf => (
                    <li key={rf} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <XCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                      {rf}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

// ─── Section 4: Sovereign Alpha ───────────────────────────────────────────────

function SovereignAlpha({ mode }: SectionProps) {
  return (
    <section id="sovereign-alpha" className="scroll-mt-20">
      <SectionTitle icon={<Brain className="h-7 w-7" />}>Sovereign Alpha — The Self-Learning Engine</SectionTitle>

      {mode === "beginner" ? (
        <div className="space-y-5">
          <BeginnerBadge />
          <Callout emoji="🧠" title="The idea in one sentence" color="purple">
            Every stock pick Fortress makes is tracked automatically at 30, 60, and 90 days. If a pick was right, the system learns which scoring rules led to it and uses those more. If it was wrong, it learns to trust those rules less.
          </Callout>
          <p className="text-muted-foreground leading-relaxed">
            It&apos;s like a doctor who checks back on every patient to see if their diagnosis was right — and uses those results to become a better diagnostician over time. Most stock platforms never tell you if their picks actually worked. We track every single one.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: "1", title: "Pick is recorded", desc: "When Fortress identifies a stock, the price is locked in as the starting point." },
              { step: "2", title: "Reality check", desc: "At 30, 60, and 90 days the system automatically fetches the current price and calculates the return." },
              { step: "3", title: "Learning", desc: "Which scoring rules predicted winners? Those get higher weight. Rules that didn't? Lower weight." },
            ].map(s => (
              <div key={s.step} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center mb-3">{s.step}</div>
                <p className="font-bold text-sm mb-1">{s.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <Callout emoji="🎯" title="The fair game rule" color="green">
            If a stock went down because of a market crash or a surprise geopolitical event — that&apos;s not the system&apos;s fault. Fortress lets you tag these &quot;unfair&quot; outcomes so the learning engine is only judged on genuine prediction quality.
          </Callout>
        </div>
      ) : (
        <div className="space-y-5">
          <ExpertBadge />
          <p className="text-muted-foreground leading-relaxed">
            Sovereign Alpha is a closed-loop performance attribution and weight-adjustment system built on 6 database tables (<code className="text-xs bg-white/10 px-1 rounded">alpha_scans</code>, <code className="text-xs bg-white/10 px-1 rounded">alpha_predictions</code>, <code className="text-xs bg-white/10 px-1 rounded">alpha_tracking</code>, <code className="text-xs bg-white/10 px-1 rounded">alpha_insights</code>, <code className="text-xs bg-white/10 px-1 rounded">alpha_overrides</code>, <code className="text-xs bg-white/10 px-1 rounded">alpha_weight_history</code>).
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-muted-foreground py-2 pr-6 font-medium">Component</th>
                  <th className="text-left text-muted-foreground py-2 font-medium">Detail</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Tracking cycles", "30d, 60d, 90d (cron-automated via price_tracker.py)"],
                  ["Hit rate calculation", "90-day checks only. Winner = return > 0%. Hit rate = winners ÷ total fair-game picks."],
                  ["Criteria Predictive Power", "(winnerMedianScore − loserMedianScore) ÷ maxPossible per criterion"],
                  ["Weight adjustment trigger", "After ≥ 5 completed 90d checks. Recommendations generated, applied on confirmation."],
                  ["Override types", "market_crash_intact | sector_rotation | external_factor → excluded from learning. thesis_broken → included."],
                  ["Hit rate breakdowns", "By market (NSE/US/HKEX), by tier (Diamond→Quartz), by risk mode (Conservative/Balanced/Aggressive)"],
                  ["Weight audit trail", "Every change logged with old weights, new weights, reason, effectiveDate"],
                ].map(([k, v]) => (
                  <tr key={k} className="border-b border-white/5">
                    <td className="py-2 pr-6 font-mono text-primary text-[11px]">{k}</td>
                    <td className="py-2 text-muted-foreground">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Section 5: Market Weather (Macro Dashboard) ──────────────────────────────

function MarketWeather({ mode }: SectionProps) {
  const signals = [
    { emoji: "💸", title: "Borrowing Cost", status: "HIGH", statusColor: "#F87171", beginner: "Banks are charging a lot for loans right now. Companies drowning in debt are struggling. Companies with no debt are fine — or even benefiting.", expert: "Elevated interest rate environment. Rising rate cycle suppresses high-multiple growth stocks; benefits value and low-leverage businesses. Watch D/E ratios closely." },
    { emoji: "🛒", title: "Inflation", status: "SLOWING", statusColor: "#FBBF24", beginner: "Prices were rising fast. Now slowing down. This means everyday companies (FMCG, consumer goods) can stabilise their cost base.", expert: "Disinflation phase. Input cost pressure easing for consumer staples and manufacturing. Margin recovery play emerging. Monitor CPI delta." },
    { emoji: "💵", title: "USD Strength", status: "STRONG", statusColor: "#F87171", beginner: "The US dollar is powerful right now. Indian IT companies (paid in USD) are winning. Indian companies paying for imports in USD are struggling.", expert: "Strong DXY. INR pressure. IT exporters (TCS, Infosys) see rupee translation gains. Import-heavy sectors (aviation, electronics assembly) face margin compression." },
    { emoji: "🎢", title: "Economic Cycle", status: "LATE STAGE", statusColor: "#FB923C", beginner: "The economy has been growing for a long time. Smart money is moving to safer, essential companies (defence, healthcare). Avoid expensive growth stocks.", expert: "Late-cycle positioning. Sector rotation toward defensives, energy, and real assets. Reduce duration risk in growth-heavy portfolios. Overweight value." },
    { emoji: "🇮🇳", title: "India Macro", status: "STABLE", statusColor: "#4ADE80", beginner: "India's central bank (RBI) is holding steady. Indian banks are stable. India's economy is growing faster than most of the world.", expert: "RBI on hold. India GDP growth ~7%. FII flows positive. PLI schemes driving manufacturing capex. Domestic demand resilient despite global uncertainty." },
    { emoji: "⚠️", title: "Key Risk", status: "TRADE TENSIONS", statusColor: "#A78BFA", beginner: "Countries are charging each other more for imports (tariffs). Bad for companies selling to the US, but GOOD for Indian factories that global companies choose over China.", expert: "US tariff regime creating supply chain realignment. China+1 beneficiaries in India (electronics, textiles, chemicals, pharma API). Monitor bilateral trade exposure." },
  ];

  const traffic = [
    { light: "🟢", sector: "Defence & Aerospace", reason: mode === "beginner" ? "Government always buys — budgets never stop. India replacing imports with local production." : "Atmanirbhar Bharat policy. Indigenisation mandates. Multi-year order books. PLI for defence." },
    { light: "🟢", sector: "Healthcare & Pharma", reason: mode === "beginner" ? "People always need medicine. Indian pharma sells to the whole world at low cost." : "Defensive sector. US generic drug opportunity. China API substitute demand. Margin recovery." },
    { light: "🟢", sector: "Indian Manufacturers (China+1)", reason: mode === "beginner" ? "Global companies moving factories from China to India. This is a 10-year shift." : "PLI capex. FDI inflows. Electronics, chemicals, textiles — all seeing order flow from global cos." },
    { light: "🟡", sector: "Large IT Services", reason: mode === "beginner" ? "Good companies, but US clients may cut tech budgets. USD is helping, US slowdown may hurt." : "USD tailwind. But US discretionary IT spending under pressure. Watch client commentary in earnings." },
    { light: "🟡", sector: "Banks & Financials", reason: mode === "beginner" ? "Stable but not exciting. Get more interesting when RBI cuts rates." : "NIM stable. Credit growth normalising. Rate cut cycle (when it begins) is a re-rating catalyst." },
    { light: "🔴", sector: "Real Estate (high-debt builders)", reason: mode === "beginner" ? "Expensive borrowing is killing companies with big loans. Avoid builders with lots of debt." : "High interest burden on leveraged developers. Demand moderating in premium segment. D/E > 2 is danger zone." },
    { light: "🔴", sector: "Luxury / Premium Consumer", reason: mode === "beginner" ? "Late-stage economy = people are more careful with money. Luxury is the first cut." : "Discretionary slowdown. ASP sensitivity. Urban consumption fatigue post-COVID-boom." },
  ];

  return (
    <section id="market-weather" className="scroll-mt-20">
      <SectionTitle icon={<Globe className="h-7 w-7" />}>Market Weather — The Macro Context</SectionTitle>

      <div className="flex items-center gap-2 mb-6">
        {mode === "beginner" ? <BeginnerBadge /> : <ExpertBadge />}
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">Updated Weekly</Badge>
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">Coming as Live Dashboard</Badge>
      </div>

      {mode === "beginner" && (
        <Callout emoji="🌤️" title="Think of this as a weather forecast for your money" color="blue">
          Just like you&apos;d dress differently on a rainy vs sunny day — you should invest differently depending on what the economy is doing. This section tells you what the economy weather looks like right now.
        </Callout>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 mb-8">
        {signals.map(s => (
          <div key={s.title} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{s.emoji}</span>
                <span className="font-bold text-sm">{s.title}</span>
              </div>
              <Badge className="text-[10px] border-0" style={{ backgroundColor: `${s.statusColor}22`, color: s.statusColor }}>
                {s.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{s.beginner}</p>
            {mode === "expert" && (
              <p className="text-[11px] text-blue-400/80 leading-relaxed mt-2 border-t border-white/10 pt-2">{s.expert}</p>
            )}
          </div>
        ))}
      </div>

      <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-4">Sector Traffic Lights</p>
      <div className="space-y-2">
        {traffic.map(t => (
          <div key={t.sector} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-xl shrink-0">{t.light}</span>
            <div>
              <p className="font-bold text-sm">{t.sector}</p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{t.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Section 5b: Multi-Bagger Score ──────────────────────────────────────────

const mbComponents = [
  {
    id: "A",
    label: "Runway Score",
    maxPts: 25,
    emoji: "🛣️",
    color: "#4ADE80",
    beginner: "How much room does the company still have to grow? We compare its size today to the total size of its entire market. A company that's captured only 0.1% of its market has 99.9% of the road ahead of it.",
    expert: "Market Cap (USD) ÷ Sector TAM (USD). Penetration < 0.1% = 25pts, < 0.5% = 20, < 1% = 14, < 3% = 8, < 5% = 3, ≥ 5% = 0. TAM from 72-sector SECTOR_TAM_USD_BN lookup table — no manual input per stock.",
  },
  {
    id: "B",
    label: "Compounding Engine",
    maxPts: 25,
    emoji: "⚙️",
    color: "#60A5FA",
    beginner: "Is this company reinvesting its profits to grow even faster? A company that keeps most of its profit inside the business (instead of paying it out as dividends) and earns a high return on that money is a compounding machine.",
    expert: "ROCE × Reinvestment Rate = theoretical annual earnings growth. Reinvestment Rate = 1 − (dividendRate × sharesOutstanding ÷ netIncomeToCommon). Compounding Engine > 20%/yr = 25pts, > 15% = 18, > 10% = 11, > 5% = 5, else 0. All fields from yfinance info.",
  },
  {
    id: "C",
    label: "Operating Leverage",
    maxPts: 20,
    emoji: "📈",
    color: "#A78BFA",
    beginner: "Is the company getting more profitable as it gets bigger? If revenue doubles but profits triple, that's operating leverage — the business is becoming more efficient at scale.",
    expert: "3-year operating margin expansion from income_stmt. Expanding > 5 pts = 20, > 2 pts = 14, stable = 8, contracting > −5 = 3, else 0. Uses real income_stmt data (not a single-point proxy) — margin direction > margin level.",
  },
  {
    id: "D",
    label: "Discovery Gap",
    maxPts: 20,
    emoji: "🔭",
    color: "#FBBF24",
    beginner: "Is the stock priced much lower than similar companies in the same industry? If a great company is trading at half the P/E of its peers, that gap will eventually close — which means the stock doubles before earnings grow at all.",
    expert: "Current P/E ÷ Sector Median P/E (SECTOR_PE_MEDIAN lookup). Ratio < 0.50 = 20pts, < 0.70 = 14, < 0.90 = 8, < 1.10 = 3, ≥ 1.10 = 0. No P/E (loss-making growth) = 5 partial credit.",
  },
  {
    id: "E",
    label: "Small-Cap Opportunity",
    maxPts: 10,
    emoji: "🔬",
    color: "#FB923C",
    beginner: "Almost every 10x or 100x stock started as a small company. Large companies are already well-known and owned by every fund manager — the discovery has happened. Small companies can still be found.",
    expert: "Market cap in USD. < $300M micro-cap = 10pts, $300M–$1B small = 8, $1B–$5B mid = 5, $5B–$20B large = 2, > $20B = 0. Cross-market normalised to USD (INR ÷ 83, HKD ÷ 7.8).",
  },
];

const mbTiers = [
  { tier: "Rocket", emoji: "🚀", range: "80–100", color: "#4ADE80", desc: "All 5 drivers aligned. Rare. This is the structure that produces 10x–50x returns over 5–10 years." },
  { tier: "Launcher", emoji: "🛸", range: "60–79", color: "#60A5FA", desc: "3–4 drivers strong. Good multi-bagger candidate. One missing piece — worth tracking for catalyst." },
  { tier: "Builder", emoji: "🏗️", range: "40–59", color: "#FBBF24", desc: "Growing into multi-bagger potential. Present but not yet fully aligned. Watchlist candidate." },
  { tier: "Crawler", emoji: "🐢", range: "20–39", color: "#FB923C", desc: "1–2 signals only. Possible early-stage or distressed. Very high risk — not for most investors." },
  { tier: "Grounded", emoji: "⛔", range: "0–19", color: "#F87171", desc: "Multi-bagger conditions absent. Large cap, mature market, low ROCE, no margin expansion." },
];

function MultiBaggerScore({ mode }: SectionProps) {
  const [activeComp, setActiveComp] = useState(0);
  return (
    <section id="multibagger" className="scroll-mt-20">
      <SectionTitle icon={<TrendingUp className="h-7 w-7" />}>Multi-Bagger Score</SectionTitle>

      {mode === "beginner" ? (
        <div className="space-y-5">
          <BeginnerBadge />
          <Callout emoji="🚀" title="What is a multi-bagger?" color="green">
            A multi-bagger is a stock that multiplies your money — 2x is a double-bagger, 10x is a ten-bagger. The term comes from Peter Lynch (the most successful fund manager in history). Multi-baggers don't happen by accident — they have a specific structure.
          </Callout>
          <p className="text-muted-foreground leading-relaxed">
            The 5-Layer engine tells you if a company is <strong className="text-white">safe</strong>. The Multi-Bagger Score asks a different question: does this company have the <strong className="text-white">structure to multiply your money?</strong> A company can be safe but not a multi-bagger. The best stocks pass both.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <ExpertBadge />
          <p className="text-muted-foreground leading-relaxed mt-3">
            MB Score (0–100) is fully automated — zero manual input per stock. Five components derived entirely from yfinance data + two lookup tables (SECTOR_TAM_USD_BN, SECTOR_PE_MEDIAN). Answers: <em>does this company have the structural prerequisites to 5x–50x?</em> Separate from the 5-layer quality score and the GEM discovery score.
          </p>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-muted-foreground">
            <strong className="text-white">Score composition:</strong> Runway 25 + Compounding Engine 25 + Operating Leverage 20 + Discovery Gap 20 + Small-Cap 10 = 100
          </div>
        </div>
      )}

      {/* Tiers */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-6 mb-8">
        {mbTiers.map(t => (
          <div key={t.tier} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl mb-1">{t.emoji}</div>
            <p className="font-bold text-xs" style={{ color: t.color }}>{t.tier}</p>
            <p className="text-[10px] text-muted-foreground">{t.range} pts</p>
            <p className="text-[10px] text-muted-foreground mt-1 leading-tight hidden sm:block">{t.desc}</p>
          </div>
        ))}
      </div>

      {/* Component deep-dive */}
      <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">The 5 Components</p>
      <div className="flex gap-2 mb-4 flex-wrap">
        {mbComponents.map((c, i) => (
          <button
            key={c.id}
            onClick={() => setActiveComp(i)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full border transition-all",
              activeComp === i ? "border-primary text-white bg-primary/20" : "border-white/20 text-muted-foreground hover:border-white/40"
            )}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeComp}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{mbComponents[activeComp].emoji}</span>
                  <span className="font-bold" style={{ color: mbComponents[activeComp].color }}>
                    {mbComponents[activeComp].label}
                  </span>
                </div>
                <Badge className="bg-white/10 border-0 text-xs">0–{mbComponents[activeComp].maxPts} pts</Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {mode === "beginner" ? mbComponents[activeComp].beginner : mbComponents[activeComp].expert}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {mode === "beginner" && (
        <Callout emoji="💡" title="Why this is separate from the safety score" color="blue">
          A company can be financially very safe but still be a boring, slow-growing business. Think of a utility company — safe as a bank, but it won't 10x your money. The Multi-Bagger Score checks for explosive growth potential separately from financial safety.
        </Callout>
      )}
    </section>
  );
}

// ─── Section 5c: Coffee Can Mode ─────────────────────────────────────────────

const ccTiers = [
  { tier: "Classic",      emoji: "☕", color: "#FCD34D", range: "80–100", beginner: "4 clean years of Revenue CAGR > 10% AND ROCE > 15%. Extremely rare. This is the buy-and-hold-forever tier.", expert: "All revenue growth years + CAGR > 10% + All ROCE years > 15% + stability bonus. ~top 3% of NSE stocks will qualify. 4-year proxy for Mukherjea's 10-year original criterion." },
  { tier: "Strong",       emoji: "🌱", color: "#4ADE80", range: "60–79", beginner: "Nearly Coffee Can quality. One small lapse in 4 years. These are the stocks you put on a serious watchlist.", expert: "Minor inconsistency in one metric or one year. Still demonstrates structural quality consistency. Most reliable candidates for the classic approach." },
  { tier: "Developing",   emoji: "📈", color: "#60A5FA", range: "40–59", beginner: "Growing into Coffee Can territory. The business is improving but hasn't yet shown 4 years of proven consistency.", expert: "Revenue or ROCE showing improvement but not yet fully consistent. Monitor for 1–2 more years. May qualify as Strong/Classic in future scans." },
  { tier: "Inconsistent", emoji: "📉", color: "#94A3B8", range: "0–39",  beginner: "Lumpy business. Revenue or returns are uneven year to year. Not suitable for the buy-and-hold Coffee Can approach.", expert: "Cyclical, volatile, or early-stage business. Standard 5-layer and GEM scoring still applies — inconsistency here doesn't mean it's a bad business, just not Coffee Can material." },
];

function CoffeeCanSection({ mode }: SectionProps) {
  return (
    <section id="coffee-can" className="scroll-mt-20">
      <SectionTitle icon={<BookOpen className="h-7 w-7" />}>Coffee Can Mode</SectionTitle>

      {mode === "beginner" ? (
        <div className="space-y-5">
          <BeginnerBadge />
          <Callout emoji="☕" title="What is Coffee Can Investing?" color="amber">
            In 1986, Robert Kirby described putting stock certificates in a coffee can and locking it in a safe for 10 years — no checking, no selling, no panic. The idea: find companies so fundamentally strong that you can ignore the market noise entirely. Saurabh Mukherjea (Marcellus Investment) adapted this for India, with two strict rules: Revenue growing at 10%+ AND Returns above 15% — every single year — for 10 years.
          </Callout>
          <p className="text-muted-foreground leading-relaxed">
            The key insight: most companies can have <em>one</em> good year. Very few can have <strong className="text-white">10 consecutive good years</strong>. The ones that do tend to have deep competitive moats — the kind that compound wealth quietly while everyone else is checking their portfolio every day.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {ccTiers.map(t => (
              <div key={t.tier} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{t.emoji}</span>
                  <span className="font-bold text-sm" style={{ color: t.color }}>{t.tier}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">{t.range}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{t.beginner}</p>
              </div>
            ))}
          </div>
          <Callout emoji="⚠️" title="Why 4 years, not 10?" color="amber">
            yfinance (our data source) provides ~4 years of annual financial history. We run a 4-year consistency check as a proxy. A stock passing all 4-year checks is already in the top 5% of listed companies — it's ON TRACK for Coffee Can status, not necessarily already there.
          </Callout>
        </div>
      ) : (
        <div className="space-y-5">
          <ExpertBadge />
          <p className="text-muted-foreground leading-relaxed mt-3">
            Coffee Can Score (0–100) — 3 automated components using <code className="text-xs bg-white/10 px-1 rounded">income_stmt</code> and <code className="text-xs bg-white/10 px-1 rounded">balance_sheet</code> from yfinance. Run with <code className="text-xs bg-white/10 px-1 rounded">python engine.py --mode coffeecan</code> to filter output to Strong + Classic only.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-muted-foreground py-2 pr-6 font-medium">Component</th>
                  <th className="text-left text-muted-foreground py-2 pr-6 font-medium">Max Pts</th>
                  <th className="text-left text-muted-foreground py-2 font-medium">Scoring Logic</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Revenue Consistency", "40", "All years growing + CAGR>10% = 40 | CAGR>7% = 28 | 1 bad year + CAGR>10% = 20 | else scaled"],
                  ["ROCE Consistency",    "40", "All years > 15% = 40 | Most > 15% = 28 | All > 10% = 20 | avg>10% = 12 | else scaled"],
                  ["Stability Bonus",     "20", "+10 if zero revenue declines | +10 if ROCE never < 10%"],
                ].map(([k, pts, logic]) => (
                  <tr key={k} className="border-b border-white/5">
                    <td className="py-2 pr-6 font-mono text-primary text-[11px]">{k}</td>
                    <td className="py-2 pr-6 text-muted-foreground">{pts}</td>
                    <td className="py-2 text-muted-foreground">{logic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ccTiers.map(t => (
              <div key={t.tier} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">{t.emoji}</div>
                <p className="font-bold text-xs" style={{ color: t.color }}>{t.tier}</p>
                <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{t.expert}</p>
              </div>
            ))}
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-muted-foreground space-y-1">
            <p><strong className="text-white">ROCE calculation:</strong> EBIT ÷ (Total Assets − Current Liabilities) — computed directly from income_stmt + balance_sheet, not from yfinance snapshot field</p>
            <p><strong className="text-white">Revenue CAGR:</strong> (Revenue<sub>newest</sub> ÷ Revenue<sub>oldest</sub>)^(1÷N) − 1 across available years</p>
            <p><strong className="text-white">CLI usage:</strong> <code className="bg-white/10 px-1 rounded">python engine.py --market NSE --mode coffeecan</code> — outputs only Strong + Classic (cc_score ≥ 60)</p>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Section 5d: Megatrend Tags ───────────────────────────────────────────────

const megatrends = [
  { tag: "Defence & Aerospace",            emoji: "🛡️", color: "#4ADE80",  beginner: "India is replacing imported weapons with locally made ones. This is a 10-year policy shift — defence budgets never get cut.",                  expert: "Atmanirbhar Bharat. Indigenisation mandate. 68% defence procurement reserved for domestic. Multi-year order books. HAL, BEL, Solar Industries, Data Patterns." },
  { tag: "Electric Vehicles & Clean Energy", emoji: "⚡", color: "#FBBF24",  beginner: "The world is switching from petrol to electric. Every battery, charger, and EV component company benefits from this shift.",                 expert: "Global EV penetration < 15% — massive runway. Battery materials (lithium, LFP), charging infrastructure, green hydrogen. PLI schemes in India for ACC batteries." },
  { tag: "Digital Payments & Fintech",     emoji: "💳", color: "#60A5FA",  beginner: "Cash is becoming digital worldwide. Payment gateways, lending apps, and digital wallets are replacing banks and cash.",                        expert: "UPI volumes $2T+ annually. BNPL, neobanks, embedded finance. Regulatory tailwind from RBI digital push. TAM: $20T+ globally." },
  { tag: "Healthcare & Diagnostics",       emoji: "💊", color: "#F87171",  beginner: "India makes medicines for the whole world cheaply. Healthcare demand always grows — people always need medicine.",                             expert: "India generic pharma = $25B export opportunity. US drug approval tailwind. China API substitute demand. Diagnostic expansion post-COVID." },
  { tag: "China+1 Manufacturing",          emoji: "🏭", color: "#FB923C",  beginner: "Global companies are moving factories from China to India. This is the biggest manufacturing shift in 30 years — and it's just starting.",      expert: "PLI schemes across 14 sectors. FDI inflows to India manufacturing. Electronics, textiles, chemicals, pharma API — all seeing order relocation from China." },
  { tag: "Global IT & AI Services",        emoji: "💻", color: "#A78BFA",  beginner: "Indian IT companies write software for the whole world. AI is now creating a new wave of demand for tech services.",                           expert: "India IT export $250B+ by 2026. GenAI demand driving cloud migration, data engineering, managed services uplift. USD tailwind for NSE IT exporters." },
  { tag: "India Infrastructure",           emoji: "🏗️", color: "#34D399",  beginner: "India is building highways, airports, metro systems, and power grids at record speed. Every company involved benefits for 10+ years.",          expert: "NIP: ₹111 lakh crore infrastructure pipeline. HAM highway model. Smart Cities Mission. T&D capex for power grid upgrades. Cement, steel, capital goods beneficiaries." },
  { tag: "India Consumption",              emoji: "🛒", color: "#FBBF24",  beginner: "India's middle class is growing and spending more. FMCG, retail, food, beverages — everything grows when 1.4 billion people earn more.",        expert: "Premiumisation trend. Rural demand recovery. E-commerce penetration sub-10% in Tier 2/3 cities — massive headroom. Staples and discretionary both benefit." },
  { tag: "Specialty Chemicals",            emoji: "🧪", color: "#60A5FA",  beginner: "Specialty chemicals are the ingredients that go into almost everything — phones, medicines, paint, fertilisers. India is becoming the global supplier.",  expert: "China+1 driving agrochemical, fluorochemical, and CDMO API sourcing to India. High-margin niche products with sticky customer relationships." },
  { tag: "Financial Services",             emoji: "🏦", color: "#4ADE80",  beginner: "Banks, insurance, and investment companies grow when the economy grows. India's financial sector is still underpenetrated compared to developed markets.", expert: "Insurance penetration India: ~4% vs 12%+ in developed markets. NBFC credit to MSMEs. Mutual fund SIP flows record high. Rate cut cycle = re-rating catalyst." },
  { tag: "Energy Transition",              emoji: "🌱", color: "#34D399",  beginner: "The world is switching from coal and oil to solar, wind, and green energy. India has committed to 500GW of renewable energy by 2030.",           expert: "India 500GW renewable target by 2030. Solar manufacturing PLI. Green hydrogen mission. Power transmission capex to carry renewables to grid. NTPC, Adani Green, CESC." },
];

function MegatrendSection({ mode }: SectionProps) {
  const [active, setActive] = useState(0);
  return (
    <section id="megatrend" className="scroll-mt-20">
      <SectionTitle icon={<Globe className="h-7 w-7" />}>Megatrend Tags</SectionTitle>

      {mode === "beginner" ? (
        <div className="space-y-4">
          <BeginnerBadge />
          <Callout emoji="🌊" title="What is a megatrend?" color="blue">
            A megatrend is a massive, multi-decade shift that reshapes entire industries — like the internet in the 90s, or smartphones in the 2000s. Investing in companies riding a megatrend is like surfing: even average swimmers look great on a big wave.
          </Callout>
          <p className="text-muted-foreground leading-relaxed">
            Fortress automatically assigns every stock a megatrend tag using the company's business description and industry. No manual work — the engine reads what the company does and classifies it. Click any megatrend below to understand what it is and why it matters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <ExpertBadge />
          <p className="text-muted-foreground leading-relaxed mt-3">
            Auto-classified via NLP keyword matching on yfinance fields: <code className="text-xs bg-white/10 px-1 rounded">longBusinessSummary</code> + <code className="text-xs bg-white/10 px-1 rounded">industry</code> + <code className="text-xs bg-white/10 px-1 rounded">sector</code>. Priority-ordered rules (first match wins). 11 megatrends defined in <code className="text-xs bg-white/10 px-1 rounded">MEGATREND_RULES</code> in engine.py. ~85% accuracy on single-business companies. Diversified conglomerates get the primary segment tag. Fallback: sector-level classification → "Diversified".
          </p>
        </div>
      )}

      {/* Tag pills */}
      <div className="flex flex-wrap gap-2 mt-5 mb-6">
        {megatrends.map((m, i) => (
          <button
            key={m.tag}
            onClick={() => setActive(i)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5",
              active === i ? "text-white bg-primary/20 border-primary" : "border-white/20 text-muted-foreground hover:border-white/40"
            )}
          >
            <span>{m.emoji}</span>
            <span>{m.tag}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{megatrends[active].emoji}</span>
                <span className="font-bold text-base" style={{ color: megatrends[active].color }}>
                  {megatrends[active].tag}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {mode === "beginner" ? megatrends[active].beginner : megatrends[active].expert}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {mode === "expert" && (
        <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-muted-foreground space-y-1">
          <p><strong className="text-white">Classification priority:</strong> Defence → EV/Energy → Fintech → Healthcare → China+1 → IT/AI → Infrastructure → Consumption → Specialty Chem → Financial Services → Energy Transition</p>
          <p><strong className="text-white">Override logic:</strong> If a defence company also does chemicals, it gets tagged Defence (higher priority). Sector-level fallback covers remaining cases.</p>
        </div>
      )}
    </section>
  );
}

// ─── Section 6: What Fortress Is NOT ─────────────────────────────────────────

function WhatIsNot() {
  return (
    <section id="not-fortress" className="scroll-mt-20">
      <SectionTitle icon={<AlertTriangle className="h-7 w-7 text-amber-500" />}>What Fortress Does NOT Do</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { emoji: "🚫", title: "We do not predict prices", desc: "No one can tell you a stock will hit ₹500 by December. Anyone who does is guessing or selling you something." },
          { emoji: "🚫", title: "We are not SEBI-registered advisors", desc: "Everything on Fortress is educational. It is not personalised investment advice. Always make your own decision." },
          { emoji: "🚫", title: "We do not tell you when to sell", desc: "Entry is a science. Exit is personal. We give you the thesis — you decide when your thesis is broken." },
          { emoji: "🚫", title: "We do not guarantee returns", desc: "Every investment has risk. Our scores tell you about quality — not about what the market will do next week." },
          { emoji: "🚫", title: "We do not use tips or insider information", desc: "Every score is derived from publicly available financial data via yfinance and NSE disclosures." },
          { emoji: "🚫", title: "We do not promote any stock", desc: "No promoter, company, or broker pays us to list their stock. Our scoring is fully automated and rules-based." },
        ].map(c => (
          <div key={c.title} className="flex gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
            <span className="text-xl shrink-0">{c.emoji}</span>
            <div>
              <p className="font-bold text-sm text-red-400 mb-1">{c.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Section 7: Key Terms Glossary ───────────────────────────────────────────

const terms = [
  { term: "Debt-to-Equity (D/E)", category: "Finance", beginner: "How much has the company borrowed compared to what it actually owns. D/E of 0.5 means for every ₹1 of owned assets, it borrowed ₹0.50. Lower is safer.", expert: "Total liabilities ÷ shareholders' equity. Fortress threshold: < 0.6 for full L1 points. NSE yfinance values often reported × 100, normalised in engine." },
  { term: "ROCE", category: "Finance", beginner: "Return on Capital Employed. If a company invested ₹100 crore and earned ₹20 crore profit, ROCE = 20%. Think of it as how efficiently they use every rupee.", expert: "EBIT ÷ Capital Employed (Total Assets − Current Liabilities). Fortress threshold: > 15% for full points. Sustained ROCE > 15% over 5 years = Coffee Can quality marker." },
  { term: "Free Cash Flow (FCF)", category: "Finance", beginner: "The real money left over after running the business AND paying for all maintenance and growth. This is what the company can actually use to pay you dividends, buy back shares, or grow further.", expert: "Operating Cash Flow − Capital Expenditure. Preferred over Net Income for valuation. FCF Yield = FCF ÷ Market Cap. Earnings Quality = FCF ÷ Net Income (> 0.8 = clean)." },
  { term: "PEG Ratio", category: "Valuation", beginner: "Price-to-Earnings relative to how fast the company is growing. A stock at P/E 30 growing 35% (PEG 0.86) is CHEAPER than a stock at P/E 15 growing 5% (PEG 3.0).", expert: "P/E ÷ Earnings Growth Rate (%). Peter Lynch metric. PEG < 1.0 = growth underpriced. PEG > 2.0 = growth fully priced in. Added to L4 in Fortress v2 engine." },
  { term: "Gross Margin", category: "Finance", beginner: "On every ₹100 of sales, how much is left after paying for the product itself. A company with 60% gross margin earns ₹60 before paying staff, rent, or taxes.", expert: "(Revenue − COGS) ÷ Revenue. Proxy for pricing power. Fortress L2 threshold: > 30% for full points. Sustained high gross margins = structural competitive advantage." },
  { term: "Promoter Holding", category: "Governance", beginner: "What percentage of the company the founders/original owners still own. High promoter holding (> 50%) means they have skin in the game — they win or lose with you. This is now a core part of L5 scoring.", expert: "heldPercentInsiders from yfinance (maps to promoter + management holding for Indian stocks). L5 v2: ≥ 50% = full points | 35–50% = partial | < 20% = zero. Steady or rising promoter % = conviction signal. Falling promoter % = caution. Note: for precise pledging data, BSE shareholding pattern API integration is planned for v2.1." },
  { term: "Promoter Pledge", category: "Governance", beginner: "When a promoter borrows money and uses their shares as collateral. High pledging (> 30%) means if the stock falls, they're forced to sell — which pushes the price even lower.", expert: "% of promoter-held shares pledged as loan security. Fortress penalty modifier: pledge > 30% = −10 GEM Score points. Pledge reduction = positive signal." },
  { term: "Earnings Quality", category: "Finance", beginner: "Are the profits real? Some companies show profit on paper but never actually generate cash. Earnings Quality checks if the profit becomes real money in the bank.", expert: "FCF ÷ Net Income. > 0.8 = high quality (profits backed by cash). 0.5–0.8 = medium. < 0.5 = red flag (accrual-heavy; Sloan 1996 effect — companies with low earnings quality underperform)." },
  { term: "Institutional Blindspot", category: "GEM Score", beginner: "When big fund managers and analysts haven't discovered a stock yet. When they finally do, they all buy at once — and if you're already in, you benefit from that rush.", expert: "Low institutional ownership (< 15%) + low analyst coverage (< 3 firms). Discovery-gap opportunity. When coverage initiates or institutions file first 13F, re-rating catalyst triggered." },
  { term: "Momentum Divergence", category: "GEM Score", beginner: "When a company is doing great business but the stock price hasn't moved yet. The business is running fast but the stock is standing still — that gap is the opportunity.", expert: "Strong fundamental trajectory (revenue, margin, FCF improving) with price flat or declining 6+ months. Volume accumulation without news. Early institutional footprint in block deals." },
  { term: "Macro Tailwind", category: "Macro", beginner: "A big economic force that helps a company without them doing anything special. Like how all Indian defence companies benefit when the government increases the defence budget.", expert: "Sector-level demand drivers from fiscal policy, RBI rates, global trade flows, or regulatory changes. L3 in Fortress measures stock vs benchmark return as a quantitative proxy." },
  { term: "Coffee Can Investing", category: "Strategy", beginner: "Buying great companies and holding them for 10+ years without touching them — like putting a stock certificate in a coffee can and forgetting about it. Popularised by Saurabh Mukherjea.", expert: "Criteria: Revenue CAGR > 10% for 10 consecutive years + ROCE > 15% for 10 consecutive years. Selects for quality consistency, not one-year snapshots. Fortress Coffee Can mode: 4-year consistency check (yfinance limitation)." },
  { term: "GEM Score", category: "GEM Score", beginner: "Fortress's main discovery score (0–100) for finding hidden opportunities. Four criteria: Is it cheap? Is it ignored by big funds? Is the business healthy? Is the price about to catch up?", expert: "4-criteria weighted score. Default weights: Valuation 30, Institutional Blindspot 25, Fundamental Strength 25, Momentum Divergence 20. Dynamic — adjusted by Sovereign Alpha after each 90-day learning cycle." },
  { term: "Stop-Loss", category: "Risk", beginner: "A rule you set before buying: 'If this stock falls 15%, I sell automatically, no questions asked.' It protects you from turning a small mistake into a disaster.", expert: "Pre-defined exit trigger. Fortress Balanced mode: −15% trailing. Aggressive mode: −8% hard stop. Conservative mode: no stop-loss (thesis-based exit only)." },
  { term: "FCF Yield", category: "Valuation", beginner: "What percentage of the company's market value it generates in free cash every year. FCF Yield of 6% means for every ₹100 you invest, the company generates ₹6 of real cash annually.", expert: "FCF ÷ Market Cap. Preferred over dividend yield for total cash return assessment. > 5% = strong. 2–5% = decent. < 2% = growth-priced or capital-intensive. Added to L1 in Fortress v2." },
  { term: "EV/EBITDA", category: "Valuation", beginner: "A way to compare how expensive a company is vs how much money it actually makes from its core business. Cheaper than P/E because it removes the effect of debt and taxes.", expert: "Enterprise Value ÷ Earnings Before Interest, Tax, Depreciation & Amortisation. Preferred for capital-intensive sectors. Removes capital structure distortion. Fortress uses for sector-relative valuation in GEM Score." },
  { term: "Dividend", category: "Corporate Actions", beginner: "A share of the company's profits paid directly to you as a shareholder in cash. If you own 100 shares and the dividend is ₹5/share, ₹500 lands in your account — no selling required. Think of it as the company paying you rent for owning it.", expert: "Cash distribution from retained earnings. Dividend Yield = Annual DPS ÷ Current Price. Sustainable = FCF covers dividend 1.5x+. High yield + low FCF coverage = dividend trap risk. Fortress tracks dividendRate from yfinance. Rising dividend over 5 years = management confidence signal." },
  { term: "Bonus Issue", category: "Corporate Actions", beginner: "The company gives you free extra shares. If you have 100 shares and it announces a 1:1 bonus, you now have 200 shares. The price halves automatically — so your total value is the same. But it signals that management believes the stock is worth more.", expert: "Corporate action converting retained earnings into paid-up equity capital. Ratio e.g. 1:1 (100% bonus), 2:1 (200% bonus). Price adjusts proportionally on ex-date — no net wealth change at issuance. Positive signal: management has surplus retained earnings and wants to reward/improve liquidity. Fortress auto-detects via yfinance .actions." },
  { term: "Stock Split", category: "Corporate Actions", beginner: "One share becomes multiple shares. A 2:1 split means your 1 share becomes 2, but the price halves. Like breaking a ₹100 note into two ₹50 notes — same value, more accessible.", expert: "Subdivision of existing shares without changing paid-up capital. Typically done when share price becomes too high for retail participation. Common ratios: 2:1, 5:1, 10:1. No fundamental impact. Improves stock liquidity and retail accessibility. Fortress auto-detects via yfinance .actions. Historically positive market reaction (improved retail access, management confidence signal)." },
  { term: "Multi-Bagger", category: "Strategy", beginner: "A stock that multiplies your money — 2x is a double-bagger (2 bags of money from 1), 10x is a ten-bagger. The term was coined by Peter Lynch, who turned the Fidelity Magellan Fund into the best-performing fund in history by finding these early.", expert: "Term from Peter Lynch's 'One Up on Wall Street'. Structural prerequisites: large TAM with low penetration, high ROCE with high reinvestment rate, operating leverage (margins expanding with scale), discovery gap (P/E below sector), small/mid cap stage. Fortress MB Score (0–100) quantifies all 5 automatically." },
  { term: "Megatrend", category: "Strategy", beginner: "A massive, decades-long shift that reshapes entire industries. The internet was a megatrend. EVs are a megatrend. India's defence indigenisation is a megatrend. Companies riding a megatrend get market tailwind even if they're average businesses.", expert: "Structural demand driver with 10–30 year horizon. Not cyclical. Not dependent on individual company execution. Fortress auto-classifies stocks into 11 megatrend buckets via NLP on yfinance business summary + industry + sector fields. Used for display and filtering — does not affect 5-layer or GEM scores directly." },
  { term: "Debt Trajectory", category: "Finance", beginner: "Is the company's debt going up or coming down over the last 3 years? A company whose debt is falling every year is getting healthier — that change in direction often triggers a re-rating (the stock price catches up to the improving reality).", expert: "3-year D/E direction from balance_sheet (most recent 3 annual columns). Falling 3yr = +8 trajectory pts, partial = +5, stable = +2, rising = 0. Integrated as 10% modifier in L1 v3. Key insight: D/E of 0.9 falling from 3.0 is a buy signal. D/E of 0.9 rising from 0.2 is a warning. Same number, opposite story." },
];

function KeyTerms({ mode }: SectionProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const categories = ["All", ...Array.from(new Set(terms.map(t => t.category)))];
  const filtered = terms.filter(t => {
    const matchSearch = t.term.toLowerCase().includes(search.toLowerCase()) ||
      t.beginner.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || t.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <section id="key-terms" className="scroll-mt-20">
      <SectionTitle icon={<BookOpen className="h-7 w-7" />}>Key Terms Explained</SectionTitle>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search terms..."
          className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-sm text-white placeholder:text-muted-foreground outline-none focus:border-primary/50"
        />
        <div className="flex gap-2 flex-wrap">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-full border transition-all whitespace-nowrap",
                activeCategory === c ? "border-primary text-white bg-primary/20" : "border-white/20 text-muted-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(t => (
          <div key={t.term} className="border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-sm text-white">{t.term}</span>
              <Badge className="text-[10px] bg-white/10 border-0">{t.category}</Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{mode === "beginner" ? t.beginner : t.expert}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-8">No terms match your search.</p>
        )}
      </div>
    </section>
  );
}

// ─── Section 8: FAQ ───────────────────────────────────────────────────────────

function FAQ() {
  const faqs = [
    { q: "How often are scores updated?", a: "The 6-layer engine scores are updated each time a market scan runs (on-demand or triggered from the Scanner tab). Each scan fetches 1 year of price history per stock for multi-band L3 momentum. Sovereign Alpha tracking runs weekly via update_alpha_outcomes.py that compares predictions to current prices and Nifty 50." },
    { q: "Why does Fortress cover NSE, US, and HKEX?", a: "Opportunity doesn't respect borders. NSE is the home market. US markets offer exposure to global tech, pharma, and payment monopolies. HKEX provides access to China-linked businesses at steep discounts to global peers. Each market has a separate benchmark for L3 scoring (Nifty 50, S&P 500, Hang Seng)." },
    { q: "What is the difference between the 6-Layer score and the GEM Score?", a: "The 6-layer score measures quality and financial health of a business — is it safe to own? The GEM Score measures discovery opportunity — is it undervalued and about to be found by the market? A company can pass both (best case), pass quality only (hold), or score high on GEM but fail quality (avoid — it's a trap)." },
    { q: "Why did my scan scores change after the v2.0 update?", a: "Three things changed in v2.0: (1) L2 now adds sector-relative margin scoring — companies above sector median get more points. (2) L3 is now multi-band — a stock that was strong 3M but weak 6M/1Y will score lower. (3) L5 now uses actual ownership data — founder-led companies with high promoter holding may score higher, while companies with low insider ownership will score lower. Old and new scores are NOT directly comparable." },
    { q: "Can the scoring weights change over time?", a: "Yes. The Sovereign Alpha learning engine analyses which GEM Score criteria actually predicted 90-day returns. If 'Valuation Edge' consistently identified winners but 'Momentum Divergence' did not, the weights shift accordingly. Every change is logged with the reason and effective date." },
    { q: "What data sources does Fortress use?", a: "Primary: yfinance Python library (Yahoo Finance data) for all financial metrics, historical prices, and benchmarks. Secondary: NSE EQUITY_L.csv for ticker universe (India). NASDAQ FTP for US universe. HKEX Excel list for Hong Kong. All sources are public and free." },
    { q: "Is my money safe if I follow Fortress picks?", a: "Fortress is an educational intelligence tool, not a fund or advisory service. We identify quality companies and explain why they passed our filters. All investment decisions are yours. Past performance of our scoring system does not guarantee future returns. Always invest only what you can afford to hold for 3–5 years." },
  ];
  return (
    <section id="faq" className="scroll-mt-20">
      <SectionTitle icon={<Info className="h-7 w-7" />}>Frequently Asked Questions</SectionTitle>
      <div className="space-y-3">
        {faqs.map(f => <Accordion key={f.q} question={f.q} answer={f.a} />)}
      </div>
    </section>
  );
}

// ─── Engine Changelog (What's New) ───────────────────────────────────────────

function EngineChangelog() {
  const changes = [
    {
      version: "v2.0 — Engine Upgrade",
      date: "March 2026",
      items: [
        { layer: "L2 Pricing Power", type: "upgrade", desc: "Added sector-relative margin premium scoring. Now checks if margins are above sector median — not just absolute thresholds. A company 30%+ above its sector peers earns maximum pricing power points." },
        { layer: "L3 Relative Strength", type: "upgrade", desc: "Extended from 3-month only to multi-band: 3M (40%) + 6M (35%) + 1Y (25%). Consistent outperformance across all three horizons = structural trend, not noise." },
        { layer: "L5 Governance", type: "rebuild", desc: "Fully rebuilt. Now uses real ownership data: promoter/insider holding %, FII/institutional holding %, short interest ratio, and debt trajectory. The previous version used D/E as a governance proxy — this is the real thing." },
        { layer: "L6 Valuation Gate", type: "new", desc: "New layer (5 pts). Eliminates stocks in genuine bubble territory: P/E > 100 with growth < 25%, or EV/EBITDA > 60 with growth < 20%. Quality growth stocks at 30–60x P/E are NOT penalised." },
        { layer: "Weights", type: "change", desc: "Default weights updated: L1:25 + L2:20 + L3:10 + L4:25 + L5:15 + L6:5 = 100. L3 reduced from 15 to 10 (momentum is confirmation, not thesis). L6 new allocation." },
      ],
    },
  ];

  const typeColors: Record<string, string> = {
    upgrade: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    rebuild: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    new:     "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    change:  "bg-purple-500/20 text-purple-300 border-purple-500/30",
  };

  return (
    <section id="changelog" className="scroll-mt-20">
      <SectionTitle icon={<Zap className="h-7 w-7" />}>What&apos;s New — Engine v2.0</SectionTitle>
      <div className="space-y-4">
        {changes.map(c => (
          <div key={c.version} className="border border-white/10 rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border-b border-white/10">
              <Zap className="h-4 w-4 text-primary" />
              <span className="font-bold text-sm text-white">{c.version}</span>
              <span className="text-xs text-muted-foreground ml-auto">{c.date}</span>
            </div>
            <div className="divide-y divide-white/5">
              {c.items.map(item => (
                <div key={item.layer} className="flex gap-3 p-4">
                  <div className="shrink-0 pt-0.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeColors[item.type]}`}>
                      {item.type}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">{item.layer}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <Callout emoji="⚠️" title="Impact on existing scores" color="amber">
          Stocks scanned before v2.0 used the old L5 proxy and no L6. Scores from previous scans are NOT comparable to v2.0 scores. Run a fresh scan to get accurate v2.0 results. The L5 rebuild in particular can change governance scores significantly — positively for founder-led companies, negatively for those with low insider ownership.
        </Callout>
      </div>
    </section>
  );
}

// ─── Beta Feedback Section ────────────────────────────────────────────────────

function BetaFeedback() {
  return (
    <section id="beta-feedback" className="scroll-mt-20">
      <SectionTitle icon={<Star className="h-7 w-7 text-amber-400" />}>Beta Feedback — Help Us Build This</SectionTitle>

      <div className="space-y-5">
        <Callout emoji="🧪" title="You are the product specification" color="amber">
          Fortress is being built specifically for NRI long-term investors. Your real-world feedback — what works, what feels wrong, what's missing — is more valuable than any internal test. Every response is read by the team.
        </Callout>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              emoji: "🎯",
              title: "Does L5 feel right to you?",
              desc: "We rebuilt L5 with promoter holding + FII data. For the Indian stocks you follow closely, does the governance score match your real-world assessment? Tell us if it gets it wrong.",
            },
            {
              emoji: "📊",
              title: "Are the tier thresholds right?",
              desc: "Rocket (80+), Launcher (65-79), Builder (60-64). Do the stocks you'd genuinely consider land in the right tiers? Or is the threshold too loose/strict?",
            },
            {
              emoji: "🔍",
              title: "What's the #1 missing signal?",
              desc: "Promoter pledging data isn't in yfinance. Neither is management commentary accuracy or dividend history quality. What would you add if you could?",
            },
            {
              emoji: "💼",
              title: "Would you use this before investing?",
              desc: "The real test: have you used a Fortress scan result to validate (or reject) an investment thesis you already had? Did it add value or tell you something you already knew?",
            },
          ].map(q => (
            <Card key={q.title} className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="text-2xl mb-2">{q.emoji}</div>
                <p className="font-bold text-sm text-white mb-1">{q.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{q.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-bold text-white mb-2">Things that are intentionally NOT in v2.0 (yet)</p>
          <div className="space-y-1 text-xs text-muted-foreground">
            {[
              "BSE shareholding pattern API for actual promoter pledging % — currently proxied by short interest",
              "Management guidance accuracy tracking (did they hit their stated revenue targets?)",
              "Dividend consistency as a separate L5 signal",
              "Related-party transaction flag from annual reports",
              "Chatbot / natural language query interface",
            ].map((item, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-primary">→</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 border-t border-white/10 pt-3">
            Tell us which of these matters most to you — that determines the priority for v2.1.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Sidebar Navigation ───────────────────────────────────────────────────────

const navItems = [
  { id: "what-is-fortress", label: "What is Fortress?", icon: Shield },
  { id: "changelog", label: "What's New v2.0", icon: Zap },
  { id: "five-layers", label: "6-Layer Engine", icon: Cpu },
  { id: "multibagger", label: "Multi-Bagger Score", icon: TrendingUp },
  { id: "coffee-can", label: "Coffee Can Mode", icon: BookOpen },
  { id: "megatrend", label: "Megatrend Tags", icon: Globe },
  { id: "gem-score", label: "GEM Score", icon: Star },
  { id: "sovereign-alpha", label: "Sovereign Alpha", icon: Brain },
  { id: "market-weather", label: "Market Weather", icon: BarChart2 },
  { id: "not-fortress", label: "What We Don't Do", icon: AlertTriangle },
  { id: "key-terms", label: "Key Terms", icon: BookOpen },
  { id: "beta-feedback", label: "Beta Feedback", icon: Star },
  { id: "faq", label: "FAQ", icon: Info },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function IntelligencePage() {
  const [mode, setMode] = useState<Mode>("beginner");

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16 pb-12 px-4 text-center overflow-hidden border-b border-white/10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/8 blur-[100px] rounded-full -z-10" />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Badge variant="secondary" className="mb-4">Intelligence Layer</Badge>
          <h1 className="text-3xl sm:text-5xl font-bold font-serif mb-4">
            How Fortress Thinks
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-base sm:text-lg leading-relaxed mb-8">
            Everything the Fortress engine does, explained for both an 18-year-old investing for the first time and a seasoned analyst who wants the formulas.
          </p>

          {/* Mode Toggle */}
          <div className="inline-flex items-center gap-1 bg-white/10 rounded-xl p-1 border border-white/20">
            <button
              onClick={() => setMode("beginner")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                mode === "beginner" ? "bg-emerald-500 text-black" : "text-muted-foreground hover:text-white"
              )}
            >
              <Users className="h-4 w-4" />
              Beginner Mode
            </button>
            <button
              onClick={() => setMode("expert")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                mode === "expert" ? "bg-blue-500 text-white" : "text-muted-foreground hover:text-white"
              )}
            >
              <BarChart2 className="h-4 w-4" />
              Expert Mode
            </button>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            {mode === "beginner" ? "Plain English. No jargon. For anyone starting their investing journey." : "Technical detail. Formulas, thresholds, architecture. For serious analysts."}
          </div>
        </motion.div>
      </section>

      {/* Share Bar */}
      <div className="bg-primary/10 border-b border-primary/20 px-4 py-2.5 flex items-center justify-center gap-3 flex-wrap">
        <span className="text-xs text-muted-foreground">Share this page for feedback:</span>
        {navItems.map(n => (
          <a
            key={n.id}
            href={`#${n.id}`}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            #{n.id}
          </a>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 container px-4 sm:px-8 py-12">
        <div className="flex gap-12">

          {/* Sidebar (desktop) */}
          <aside className="hidden lg:block w-52 shrink-0">
            <div className="sticky top-24 space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3 font-bold">Contents</p>
              {navItems.map(item => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-white transition-colors py-1.5 px-2 rounded-lg hover:bg-white/5"
                >
                  <item.icon className="h-3.5 w-3.5 shrink-0" />
                  {item.label}
                </a>
              ))}
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("w-2 h-2 rounded-full", mode === "beginner" ? "bg-emerald-500" : "bg-blue-500")} />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    {mode === "beginner" ? "Beginner Mode" : "Expert Mode"}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setMode(mode === "beginner" ? "expert" : "beginner")}
                >
                  Switch to {mode === "beginner" ? "Expert" : "Beginner"}
                </Button>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0 space-y-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-20"
              >
                <WhatIsFortress mode={mode} />
                <EngineChangelog />
                <FiveLayerEngine mode={mode} />
                <MultiBaggerScore mode={mode} />
                <CoffeeCanSection mode={mode} />
                <MegatrendSection mode={mode} />
                <GemScore mode={mode} />
                <SovereignAlpha mode={mode} />
                <MarketWeather mode={mode} />
                <WhatIsNot />
                <KeyTerms mode={mode} />
                <BetaFeedback />
                <FAQ />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-10 bg-background">
        <div className="container px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-bold font-serif">Fortress Intelligence</span>
          </div>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            Not a SEBI-registered investment advisor. All content is for educational purposes only. Past scoring performance does not guarantee future returns. Always do your own research.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
            {navItems.map(n => (
              <a key={n.id} href={`#${n.id}`} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                {n.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
