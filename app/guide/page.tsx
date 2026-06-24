"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/fortress/Navbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Shield, Search, BookOpen, TrendingUp, BarChart3, Activity,
    CheckCircle2, ArrowRight, Star, Coffee, Globe, Zap, Target,
    ChevronDown, ChevronUp, AlertTriangle, Users, Filter, MessageSquare,
    Sparkles, Brain
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Step Card ────────────────────────────────────────────────────────────────

function Step({ num, title, description, href, linkLabel }: {
    num: number; title: string; description: string; href?: string; linkLabel?: string;
}) {
    return (
        <div className="flex gap-5">
            <div className="shrink-0 flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-sm">
                    {num}
                </div>
                {num < 6 && <div className="w-px flex-1 bg-white/10 mt-2 min-h-[2rem]" />}
            </div>
            <div className="pb-8">
                <h3 className="font-bold text-white mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                {href && linkLabel && (
                    <Link href={href} className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2 font-medium">
                        {linkLabel} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                )}
            </div>
        </div>
    );
}

// ─── Score Tier ───────────────────────────────────────────────────────────────

function TierCard({ emoji, tier, range, color, meaning }: {
    emoji: string; tier: string; range: string; color: string; meaning: string;
}) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex gap-3 items-start">
            <span className="text-2xl shrink-0">{emoji}</span>
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm" style={{ color }}>{tier}</span>
                    <span className="text-[10px] font-mono text-muted-foreground bg-white/10 px-1.5 py-0.5 rounded">{range}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{meaning}</p>
            </div>
        </div>
    );
}

// ─── Layer Row ────────────────────────────────────────────────────────────────

function LayerRow({ id, label, icon: Icon, color, plain, detail }: {
    id: string; label: string; icon: React.ElementType; color: string;
    plain: string; detail: string;
}) {
    const [open, setOpen] = useState(false);
    return (
        <button
            onClick={() => setOpen(!open)}
            className="w-full text-left border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors"
        >
            <div className="flex items-center gap-4 p-4">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", color)}>
                    <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">{id}</span>
                        <span className="font-semibold text-sm text-white">{label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{plain}</p>
                </div>
                {open ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
            </div>
            {open && (
                <div className="px-4 pb-4 pt-0 border-t border-white/10 text-xs text-muted-foreground leading-relaxed bg-white/[0.02]">
                    {detail}
                </div>
            )}
        </button>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GuidePage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Navbar provided by layout */}

            <main className="container max-w-3xl mx-auto px-4 sm:px-8 py-12 space-y-16">

                {/* Hero */}
                <div className="text-center space-y-4">
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Beta User Guide</Badge>
                    <h1 className="text-3xl sm:text-4xl font-bold font-serif leading-tight">
                        Welcome to Fortress Intelligence
                    </h1>
                    <p className="text-muted-foreground text-lg leading-relaxed max-w-xl mx-auto">
                        India's most rigorous stock research platform — built for serious long-term investors
                        who think in decades, not days.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        You're part of a small group of early beta testers. Here's everything you need to know.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                        <Zap className="h-4 w-4" /> Sovereign Alpha + Investment Genie Live — Spring 2026
                    </div>
                </div>

                {/* What can you do */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold font-serif">What can you do here?</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            {
                                icon: Sparkles, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20",
                                title: "Investment Genie",
                                desc: "Cluster-based portfolio allocation. Tell us your risk, get a diversified plan in seconds."
                            },
                            {
                                icon: Brain, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20",
                                title: "Sovereign Alpha",
                                desc: "Performance tracking system that measures engine accuracy vs benchmarks in real-time."
                            },
                            {
                                icon: Search, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20",
                                title: "Intelligent Scanner",
                                desc: "Screen 2,000+ NSE stocks through 6 financial quality layers. Runs every weekday."
                            },
                        ].map(item => (
                            <Card key={item.title} className={cn("border", item.bg)}>
                                <CardContent className="p-5 space-y-2">
                                    <item.icon className={cn("h-6 w-6", item.color)} />
                                    <h3 className="font-bold text-white">{item.title}</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Step by step */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold font-serif">Your first 10 minutes</h2>
                    <div>
                        <Step
                            num={1}
                            title="Start with Fortress 30"
                            description="Go to the Fortress 30 page. Browse the 30 hand-picked stocks. Each card shows the company name, sector, and quality tags. These are already vetted — no scanning needed."
                            href="/fortress-30"
                            linkLabel="Open Fortress 30"
                        />
                        <Step
                            num={2}
                            title="Click any stock to read its thesis"
                            description="Tap any stock card to see its full investment thesis: why it was chosen, what the moat is, what the risks are, and the financial strength score."
                        />
                        <Step
                            num={3}
                            title="Go to Deep Value Scanner → Intelligent Scanner tab"
                            description="Click 'Run Full Scan' to scan all 2,000+ NSE stocks. Takes 20–40 minutes — runs on the server, safe to close. Once done, the 52W Lows, Penny, and Sub-₹20 tabs auto-populate with live scanner results alongside curated picks."
                            href="/v5-extension"
                            linkLabel="Open Scanner"
                        />
                        <Step
                            num={4}
                            title="Switch to Live Results when done"
                            description="Once the scan completes, click the 'Live Results' tab. You'll see every stock that scored above 60, sorted by Multi-Bagger Score. Filter by Megatrend, tier, or Coffee Can status."
                        />
                        <Step
                            num={5}
                            title="Check Market Pulse for macro context"
                            description="Before making any decision, check the Market Pulse page. It shows Nifty 50, USD/INR, Gold, Crude, US 10Y yield, and VIX — weekly snapshots of the macro environment."
                            href="/macro"
                            linkLabel="Open Market Pulse"
                        />
                        <Step
                            num={6}
                            title="Read Intelligence to go deeper"
                            description="The Intelligence page explains every concept in plain English (or expert mode if you prefer). Start with 'What is Fortress?' and work down. Toggle between Beginner and Expert mode at the top."
                            href="/intelligence"
                            linkLabel="Open Intelligence"
                        />
                    </div>
                </section>

                {/* Score tiers */}
                <section className="space-y-4">
                    <div>
                        <h2 className="text-xl font-bold font-serif">Understanding the Score</h2>
                        <p className="text-sm text-muted-foreground mt-1">Every stock scores 0–100 across 6 layers (L1+L2+L3+L4+L5+L6). Only scores above 60 appear in results.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <TierCard emoji="🚀" tier="Rocket" range="80–100" color="#4ADE80"
                            meaning="Exceptional quality. Passes all 5 layers convincingly. Strong multi-bagger candidate." />
                        <TierCard emoji="🛸" tier="Launcher" range="65–79" color="#60A5FA"
                            meaning="Strong company. Minor gaps in one area but fundamentally sound." />
                        <TierCard emoji="🏗️" tier="Builder" range="60–64" color="#FCD34D"
                            meaning="Meets the minimum bar. Worth watching. May graduate to Launcher with better results." />
                        <TierCard emoji="❌" tier="Below threshold" range="0–59" color="#94A3B8"
                            meaning="Automatically filtered out. Not shown in results. Revisited in future scans." />
                    </div>
                </section>

                {/* What's New */}
                <section className="space-y-4">
                    <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="h-4 w-4 text-purple-400" />
                            <span className="font-bold text-sm text-purple-300">What's new in Engine v3</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                            {[
                                { label: "Multi-Bagger Score", desc: "Separate 0–100 score for multi-bagger potential: FCF yield, PEG, operating leverage, discovery gap" },
                                { label: "Coffee Can Mode", desc: "Identifies 4+ year consistent compounders: 10%+ revenue CAGR and ROCE > 15% every year" },
                                { label: "L5 rebuilt", desc: "Governance proxy: D/E < 1.0, positive operating cash flow, and debt trajectory over 3 years" },
                                { label: "Live Scanner Tabs", desc: "52W Lows, Penny, and Sub-₹20 tabs now auto-populate from scan results alongside curated picks" },
                            ].map(item => (
                                <div key={item.label} className="flex gap-2">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                                    <span><span className="text-white font-medium">{item.label}:</span> {item.desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 6 Layers */}
                <section className="space-y-4">
                    <div>
                        <h2 className="text-xl font-bold font-serif">The 6-Layer Framework — Plain English</h2>
                        <p className="text-sm text-muted-foreground mt-1">Click each layer to see what it actually checks. Scores above 60/100 pass the Fortress threshold.</p>
                    </div>
                    <div className="space-y-2">
                        <LayerRow
                            id="L1 · 25pts" label="Protection" icon={Shield} color="bg-emerald-600"
                            plain="Is the company's debt under control?"
                            detail="Checks debt-to-equity ratio, whether operating cash flow is positive, and whether debt is rising or falling over 3 years. Also checks ROCE (Return on Capital Employed) and FCF yield. High debt + negative cash flow = fails this layer. This is the hardest filter — no debt-laden company passes."
                        />
                        <LayerRow
                            id="L2 · 20pts" label="Pricing Power" icon={BarChart3} color="bg-blue-600"
                            plain="Can this company charge what it wants?"
                            detail="Upgraded in v2: scores on absolute gross margin, absolute operating margin, AND whether margins are above the sector median. A company 30%+ above its sector peers in gross margins has genuine pricing power — it can raise prices without losing customers. Banks/NBFCs use a separate operating margin model."
                        />
                        <LayerRow
                            id="L3 · 10pts" label="Relative Strength" icon={Activity} color="bg-amber-600"
                            plain="Is the market already rewarding this stock?"
                            detail="Upgraded in v2: Now checks 3 historical time horizons — 3-month (40%), 6-month (35%), and 1-year (25%) performance vs Nifty 50. A stock that has outperformed consistently across all three periods is in a structural trend, not a short-term blip. Weighted so longer-term outperformance matters more. Past performance does not guarantee future results."
                        />
                        <LayerRow
                            id="L4 · 25pts" label="Growth Engine" icon={TrendingUp} color="bg-purple-600"
                            plain="Is revenue and profit actually growing?"
                            detail="Scores on revenue growth rate, earnings growth rate, and PEG ratio (P/E ÷ earnings growth). PEG < 0.8 means you're getting growth cheaper than it costs — Peter Lynch's core buy signal. A company growing 30% at P/E 25 (PEG 0.83) is cheaper than a company growing 5% at P/E 20 (PEG 4.0). Growth without cash flow is also flagged."
                        />
                        <LayerRow
                            id="L5 · 15pts" label="Governance" icon={Users} color="bg-rose-600"
                            plain="Are the right people owning and watching this company?"
                            detail="A governance quality proxy using three signals available from public data: (A) Debt-to-equity below 1.0 — management not overleveraging the business. (B) Positive operating cash flow — the business is genuinely generating cash, not just accounting profits. (C) Debt trajectory over 3 years — is debt falling (healthy), stable, or rising (red flag)? Manpasand, DHFL, and Yes Bank all passed L1-L4 before their collapses. L5 catches the pattern of deteriorating governance early through balance sheet behaviour."
                        />
                        <LayerRow
                            id="L6 · 5pts" label="Valuation Gate" icon={Filter} color="bg-slate-600"
                            plain="Is it priced at bubble levels with no justification?"
                            detail="New in v2. A light sanity check — not a value screen. Coffee Can stocks legitimately trade at 30–60x earnings. This layer only zeros out genuine bubbles: P/E > 100 with earnings growth under 25%, or EV/EBITDA > 60 with sub-20% growth. A quality growth stock at 45x P/E with 30% growth earns full marks. A mid-cap at 150x P/E growing 5% gets a hard zero."
                        />
                    </div>
                </section>

                {/* Special modes */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold font-serif">Special Features</h2>
                    <div className="space-y-3">
                        <Card className="bg-amber-500/5 border-amber-500/20">
                            <CardContent className="p-5 flex gap-4">
                                <Coffee className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-bold text-white mb-1">Coffee Can Mode ☕</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Inspired by Saurabh Mukherjea's Coffee Can Investing — finds businesses with 4+ years of consistent
                                        revenue growth (10%+ CAGR) AND Return on Capital above 15% every single year.
                                        These are rare, durable compounders. Filter results by "Classic" or "Strong" Coffee Can tier.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-blue-500/5 border-blue-500/20">
                            <CardContent className="p-5 flex gap-4">
                                <Globe className="h-6 w-6 text-blue-400 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-bold text-white mb-1">Megatrend Tags 🌐</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Each stock is automatically tagged to one of India's 9 structural megatrends:
                                        Defence & Aerospace, Digital India, Electric Vehicles, Infrastructure, Healthcare & Pharma,
                                        Renewable Energy, FMCG & Consumption, Financial Inclusion, and Space & Deep Tech.
                                        Use the filter in results to focus on sectors you understand.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-purple-500/5 border-purple-500/20">
                            <CardContent className="p-5 flex gap-4">
                                <Zap className="h-6 w-6 text-purple-400 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-bold text-white mb-1">Multi-Bagger Score 🚀</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        A separate score (0–100) that specifically looks for multi-bagger potential:
                                        Free Cash Flow yield, earnings quality, PEG ratio, operating leverage, and discovery gap
                                        (how far below sector median P/E the stock trades). Rocket tier = rare, high-conviction pick.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Beta tips */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold font-serif">Tips for Beta Testers</h2>
                    <div className="space-y-2">
                        {[
                            { icon: Star, text: "The scanner runs automatically every weekday evening. Results are always fresh by morning." },
                            { icon: Target, text: "Start with Rocket-tier stocks. Then explore Launchers for hidden gems the market hasn't repriced yet." },
                            { icon: Coffee, text: "Coffee Can Classic stocks are the rarest. If you find one scoring 80+, that's a serious long-term hold candidate." },
                            { icon: Globe, text: "Combine Megatrend filter + Coffee Can filter to find consistent compounders in structural growth sectors." },
                            { icon: BarChart3, text: "Check Market Pulse before acting. A great stock in a bad macro environment might need patience." },
                        ].map((tip, i) => (
                            <div key={i} className="flex gap-3 p-3 rounded-xl border border-white/10 bg-white/5">
                                <tip.icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <p className="text-sm text-muted-foreground">{tip.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Beta Feedback */}
                <section className="space-y-4">
                    <div>
                        <h2 className="text-xl font-bold font-serif">Help us improve — Beta Feedback</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            You're using a live research engine. Your feedback directly shapes what gets built next.
                        </p>
                    </div>
                    <Card className="bg-emerald-500/5 border-emerald-500/20">
                        <CardContent className="p-5 space-y-4">
                            <div className="flex gap-3">
                                <MessageSquare className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-bold text-white mb-2">What we want to know from you</h3>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        {[
                                            "Do scan results match companies you already know are high quality?",
                                            "Does the L5 Governance score feel accurate for Indian stocks you follow?",
                                            "Are there stocks that should score higher (or lower) than they do?",
                                            "What's the #1 data point missing that would make this more useful?",
                                            "Would you use this before making an actual investment decision?",
                                        ].map((q, i) => (
                                            <div key={i} className="flex gap-2">
                                                <span className="text-emerald-400 font-bold shrink-0">{i + 1}.</span>
                                                <span>{q}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-white/10 pt-3 text-xs text-muted-foreground">
                                Send feedback to the team directly via WhatsApp or email. Every response is read and discussed.
                                Your experience as an NRI investor is the product spec.
                            </div>
                        </CardContent>
                    </Card>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        {[
                            { emoji: "🐛", label: "Bug found", desc: "Score looks wrong or data is obviously incorrect" },
                            { emoji: "💡", label: "Feature idea", desc: "Something you wish the scanner checked or showed" },
                            { emoji: "✅", label: "Validation", desc: "A stock scored high and it turned out to be right" },
                        ].map(item => (
                            <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                                <div className="text-xl mb-1">{item.emoji}</div>
                                <div className="font-semibold text-white text-xs mb-0.5">{item.label}</div>
                                <div className="text-muted-foreground leading-relaxed">{item.desc}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Disclaimer */}
                <section>
                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 flex gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                        <div className="text-sm text-red-200/80 space-y-1">
                            <p className="font-bold text-red-300">This is research, not advice.</p>
                            <p>Fortress Intelligence is a stock screening and research tool. Nothing on this platform
                            constitutes financial advice, investment advice, or a recommendation to buy or sell any
                            security. All investment decisions carry risk. Please do your own due diligence and
                            consult a SEBI-registered advisor before investing.</p>
                        </div>
                    </div>
                </section>

                {/* Quick links */}
                <section className="text-center space-y-4 pb-8">
                    <h2 className="text-xl font-bold font-serif">Ready to explore?</h2>
                    <div className="flex flex-wrap gap-3 justify-center">
                        {[
                            { href: "/fortress-30", label: "Fortress 30", icon: Shield },
                            { href: "/v5-extension", label: "Live Scanner", icon: Search },
                            { href: "/macro", label: "Market Pulse", icon: Globe },
                            { href: "/intelligence", label: "Intelligence", icon: BookOpen },
                        ].map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-colors"
                            >
                                <link.icon className="h-4 w-4 text-primary" />
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </section>

            </main>
        </div>
    );
}
