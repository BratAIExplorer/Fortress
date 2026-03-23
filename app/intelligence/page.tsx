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
            Instead of phones, we do this for companies listed on the stock market. We run every company through a <strong className="text-white">5-question quality test</strong>, give them a score, and flag the ones that actually deserve your attention — not the ones with the loudest news.
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
            Fortress Intelligence is a rules-based stock intelligence platform built for Indian retail investors. It combines a <strong className="text-white">quantitative 5-layer scoring engine</strong> (Python, yfinance), a <strong className="text-white">4-criteria GEM Score system</strong> (AI-assisted discovery), and a <strong className="text-white">self-learning performance tracker</strong> (Sovereign Alpha) that measures prediction accuracy at 30/60/90-day intervals and adjusts scoring weights accordingly.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Markets covered: <strong className="text-white">NSE (India), NYSE/NASDAQ (US), HKEX (Hong Kong)</strong>. The system is not SEBI-registered and makes no investment recommendations — it publishes frameworks and scored data for educational use.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Markets", value: "3 (NSE, US, HKEX)" },
              { label: "Scoring Layers", value: "5 automated + 1 manual" },
              { label: "GEM Criteria", value: "4 (dynamic weights)" },
              { label: "Tracking cycles", value: "30d / 60d / 90d" },
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

// ─── Section 2: The 5-Layer Engine ───────────────────────────────────────────

const layers = [
  {
    id: "L1",
    icon: "🛡️",
    color: "#4ADE80",
    label: "L1 — Protection",
    beginner: {
      question: "Is this company financially safe?",
      analogy: "Think of it like checking if someone has savings and no credit card debt before lending them money.",
      whatWeCheck: [
        "Does the company owe more than it earns? (Debt check)",
        "Does it actually generate real cash, not just accounting profit?",
        "Is it earning a good return on the money invested in it?",
        "What percentage of its profit actually becomes real cash in hand?",
      ],
      passExample: "Asian Paints, Pidilite — zero or very low debt, consistent cash generation.",
      failExample: "A real estate developer with 5x debt-to-equity and negative cash flow.",
    },
    expert: {
      metrics: [
        { name: "Debt/Equity (D/E)", threshold: "< 0.6 full pts | 0.6–1.0 half pts | > 1.0 zero", note: "NSE raw values divided by 100 for normalisation" },
        { name: "ROCE", threshold: "> 15% full pts | 10–15% half pts", note: "Return on Capital Employed" },
        { name: "Operating Cash Flow", threshold: "Positive = pass (binary)", note: "" },
        { name: "FCF Yield (NEW)", threshold: "> 5% full | 2–5% half", note: "freeCashflow ÷ marketCap" },
        { name: "Earnings Quality (NEW)", threshold: "> 0.8 full | 0.5–0.8 half", note: "freeCashflow ÷ netIncomeToCommon" },
      ],
      maxPts: 25,
      weight: "28% D/E | 28% ROCE | 14% OCF | 18% FCF Yield | 12% Earnings Quality",
    },
  },
  {
    id: "L2",
    icon: "💪",
    color: "#60A5FA",
    label: "L2 — Pricing Power",
    beginner: {
      question: "Can this company charge more tomorrow and keep its customers?",
      analogy: "Fevicol can raise prices — there's no real alternative. A rice seller cannot — you'll just buy from the next stall.",
      whatWeCheck: [
        "How much profit does it make on every ₹100 of sales? (Gross margin)",
        "After all expenses, how much is left? (Operating margin)",
        "Are those margins growing or shrinking over time?",
      ],
      passExample: "Nestle, Asian Paints — 40–60% gross margins. Premium pricing is accepted.",
      failExample: "Steel, cement companies — commodity businesses where price is set by the market.",
    },
    expert: {
      metrics: [
        { name: "Gross Margins", threshold: "> 30% full pts | 20–30% half pts", note: "grossMargins from yfinance" },
        { name: "Operating Margins", threshold: "> 15% full pts | 10–15% half pts", note: "operatingMargins from yfinance" },
      ],
      maxPts: 20,
      weight: "50% Gross Margin | 50% Operating Margin",
    },
  },
  {
    id: "L3",
    icon: "💨",
    color: "#A78BFA",
    label: "L3 — Macro Tailwind",
    beginner: {
      question: "Is the wind blowing behind this company or against it?",
      analogy: "Cycling uphill (no tailwind) is hard even for a great cyclist. Cycling downhill (tailwind) makes even average cyclists look fast. L3 checks if the broad economy is helping or hurting this company.",
      whatWeCheck: [
        "Has the stock outperformed its country's main index over 3 months?",
        "Is it beating the Nifty 50 (India), S&P 500 (US), or Hang Seng (HK)?",
      ],
      passExample: "A defence company when government is increasing defence budget — sector tailwind.",
      failExample: "An IT company when USD/INR is unfavourable and US clients cutting budgets.",
    },
    expert: {
      metrics: [
        { name: "Relative Return (3-month)", threshold: "> benchmark × 1.1 = full | > benchmark = 2/3 pts | > 0 = 1/3 pts | ≤ 0 = zero", note: "Stock return vs NSE/S&P/HSI benchmark" },
      ],
      maxPts: 15,
      weight: "100% relative return vs market benchmark (3-month window)",
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
    label: "L5 — Governance Quality",
    beginner: {
      question: "Would you trust this management with your wallet?",
      analogy: "You'd lend money to a friend who always pays back, never to one who keeps borrowing and disappearing. L5 is the management character check.",
      whatWeCheck: [
        "Does the promoter (founder/owner) own a large % of the company?",
        "Have they pledged their shares as loan collateral? (Red flag)",
        "Has the auditor raised any concerns?",
        "Is there any history of fraud or regulatory action?",
      ],
      passExample: "Tata group — transparent, consistent, promoter-accountable.",
      failExample: "A company where promoter pledged 60% of shares and auditor quit mid-year.",
    },
    expert: {
      metrics: [
        { name: "Status", threshold: "Currently a manual input (0–15 pts)", note: "Automated in next sprint: NSE shareholding pattern API for promoter % and pledge %" },
      ],
      maxPts: 15,
      weight: "Manual override — becomes automated L6 Promoter Conviction module in Sprint 3",
    },
  },
];

function FiveLayerEngine({ mode }: SectionProps) {
  const [expanded, setExpanded] = useState<string | null>("L1");

  return (
    <section id="five-layers" className="scroll-mt-20">
      <SectionTitle icon={<Cpu className="h-7 w-7" />}>The 5-Layer Scoring Engine</SectionTitle>

      {mode === "beginner" ? (
        <div className="mb-6">
          <BeginnerBadge />
          <p className="text-muted-foreground leading-relaxed mt-3">
            Every company we scan gets put through <strong className="text-white">5 questions</strong>. Each question is worth points. A company needs at least <strong className="text-white">60 out of 100</strong> to even show up on our radar. Click each layer to see what we&apos;re actually checking.
          </p>
        </div>
      ) : (
        <div className="mb-6">
          <ExpertBadge />
          <p className="text-muted-foreground leading-relaxed mt-3">
            The engine runs in Python using yfinance data. It scores each stock 0–100 across 5 automated layers. Stocks scoring ≥ 60 are classified by price category; below 60 are marked <code className="text-xs bg-white/10 px-1 rounded">OFFLINE</code>. The engine runs concurrently (ThreadPoolExecutor, 5 workers, batch size 20) with 1-second rate-limit delays.
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
  { term: "Promoter Holding", category: "Governance", beginner: "What percentage of the company the founders/original owners still own. High promoter holding (> 60%) means they have skin in the game — they win or lose with you.", expert: "Disclosed quarterly via NSE shareholding pattern. Steady or rising promoter % = conviction signal. Falling promoter % = caution. Planned as automated L6 in Sprint 3." },
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
    { q: "How often are scores updated?", a: "The 5-layer engine scores are updated each time a market scan runs (on-demand or scheduled). GEM Scores are generated per discovery session. Sovereign Alpha tracking runs daily via a cron job that fetches current prices for all active predictions." },
    { q: "Why does Fortress cover NSE, US, and HKEX?", a: "Opportunity doesn't respect borders. NSE is the home market. US markets offer exposure to global tech, pharma, and payment monopolies. HKEX provides access to China-linked businesses at steep discounts to global peers. Each market has a separate benchmark for L3 scoring (Nifty 50, S&P 500, Hang Seng)." },
    { q: "What is the difference between the 5-Layer score and the GEM Score?", a: "The 5-Layer score measures quality and financial health of a business — is it safe to own? The GEM Score measures discovery opportunity — is it undervalued and about to be found by the market? A company can pass both (best case), pass quality only (hold), or score high on GEM but fail quality (avoid — it's a trap)." },
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

// ─── Sidebar Navigation ───────────────────────────────────────────────────────

const navItems = [
  { id: "what-is-fortress", label: "What is Fortress?", icon: Shield },
  { id: "five-layers", label: "5-Layer Engine", icon: Cpu },
  { id: "gem-score", label: "GEM Score", icon: Star },
  { id: "sovereign-alpha", label: "Sovereign Alpha", icon: Brain },
  { id: "market-weather", label: "Market Weather", icon: Globe },
  { id: "not-fortress", label: "What We Don't Do", icon: AlertTriangle },
  { id: "key-terms", label: "Key Terms", icon: BookOpen },
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
                <FiveLayerEngine mode={mode} />
                <GemScore mode={mode} />
                <SovereignAlpha mode={mode} />
                <MarketWeather mode={mode} />
                <WhatIsNot />
                <KeyTerms mode={mode} />
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
