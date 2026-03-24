"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/fortress/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MacroSnapshot {
    id: string;
    snapshotDate: string;
    nifty50: string | null;
    bankNifty: string | null;
    usdInr: string | null;
    goldUsd: string | null;
    crudeOilUsd: string | null;
    us10yYield: string | null;
    cboeVix: string | null;
    indiaVix: string | null;
    fetchedAt: string;
}

// ─── Indicator config ─────────────────────────────────────────────────────────

interface IndicatorConfig {
    key: keyof MacroSnapshot;
    label: string;
    emoji: string;
    desc: string;
    format: (v: number) => string;
    chgType: "pct" | "bps";
    invertColor?: boolean; // true = rising is bad (VIX, USD/INR)
}

const INDICATORS: IndicatorConfig[] = [
    {
        key: "nifty50", label: "Nifty 50", emoji: "🇮🇳", desc: "India benchmark index",
        format: (v) => v.toLocaleString("en-IN", { maximumFractionDigits: 2 }),
        chgType: "pct",
    },
    {
        key: "bankNifty", label: "Bank Nifty", emoji: "🏦", desc: "Banking sector index",
        format: (v) => v.toLocaleString("en-IN", { maximumFractionDigits: 2 }),
        chgType: "pct",
    },
    {
        key: "usdInr", label: "USD / INR", emoji: "💱", desc: "Rupee vs Dollar",
        format: (v) => `₹${v.toFixed(2)}`,
        chgType: "pct",
        invertColor: true,
    },
    {
        key: "goldUsd", label: "Gold", emoji: "🥇", desc: "Comex $/oz",
        format: (v) => `$${v.toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
        chgType: "pct",
    },
    {
        key: "crudeOilUsd", label: "Crude Oil", emoji: "🛢️", desc: "WTI $/bbl",
        format: (v) => `$${v.toFixed(2)}`,
        chgType: "pct",
        invertColor: true,
    },
    {
        key: "us10yYield", label: "US 10Y Yield", emoji: "🏛️", desc: "Treasury yield",
        format: (v) => `${v.toFixed(2)}%`,
        chgType: "bps",
        invertColor: true,
    },
    {
        key: "cboeVix", label: "CBOE VIX", emoji: "📊", desc: "US fear gauge",
        format: (v) => v.toFixed(2),
        chgType: "pct",
        invertColor: true,
    },
    {
        key: "indiaVix", label: "India VIX", emoji: "🔔", desc: "India volatility",
        format: (v) => v.toFixed(2),
        chgType: "pct",
        invertColor: true,
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseNum(s: string | null): number | null {
    if (s == null) return null;
    const n = parseFloat(s);
    return isNaN(n) ? null : n;
}

function computeChange(current: number | null, prev: number | null, type: "pct" | "bps"): number | null {
    if (current == null || prev == null || prev === 0) return null;
    return type === "bps" ? (current - prev) * 100 : ((current - prev) / prev) * 100;
}

function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Change Badge ─────────────────────────────────────────────────────────────

function ChangeBadge({ change, type, invert }: { change: number | null; type: "pct" | "bps"; invert?: boolean }) {
    if (change == null) return <span className="text-xs text-muted-foreground">—</span>;

    const isPositive = change > 0;
    const isGood = invert ? !isPositive : isPositive;
    const abs = Math.abs(change);
    const label = type === "bps"
        ? `${isPositive ? "+" : ""}${abs.toFixed(1)} bps`
        : `${isPositive ? "+" : ""}${abs.toFixed(2)}%`;

    return (
        <span className={cn(
            "flex items-center gap-0.5 text-xs font-medium",
            isGood ? "text-emerald-400" : "text-red-400"
        )}>
            {isPositive
                ? <TrendingUp className="h-3 w-3" />
                : change < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
            {label}
        </span>
    );
}

// ─── Indicator Card ───────────────────────────────────────────────────────────

function IndicatorCard({ cfg, current, prev }: {
    cfg: IndicatorConfig;
    current: MacroSnapshot;
    prev: MacroSnapshot | null;
}) {
    const val = parseNum(current[cfg.key] as string | null);
    const prevVal = prev ? parseNum(prev[cfg.key] as string | null) : null;
    const change = computeChange(val, prevVal, cfg.chgType);

    return (
        <Card className="bg-white/5 border-white/10 hover:bg-white/[0.07] transition-colors">
            <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <span className="text-xl mr-1.5">{cfg.emoji}</span>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{cfg.label}</span>
                    </div>
                    {prev && <ChangeBadge change={change} type={cfg.chgType} invert={cfg.invertColor} />}
                </div>
                <p className="text-2xl font-bold font-mono text-white">
                    {val != null ? cfg.format(val) : <span className="text-muted-foreground text-base">N/A</span>}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">{cfg.desc}</p>
            </CardContent>
        </Card>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MacroPage() {
    const [snapshots, setSnapshots] = useState<MacroSnapshot[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/macro?limit=8")
            .then(r => r.json())
            .then(d => setSnapshots(d.snapshots ?? []))
            .finally(() => setLoading(false));
    }, []);

    const latest = snapshots[0] ?? null;
    const previous = snapshots[1] ?? null;
    const history = snapshots.slice(1);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="container max-w-6xl mx-auto px-4 sm:px-8 py-12 space-y-12">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mb-3">Market Pulse</Badge>
                        <h1 className="text-3xl sm:text-4xl font-bold font-serif">Macro Snapshot</h1>
                        <p className="text-muted-foreground mt-2 max-w-lg">
                            Weekly macro context for Indian markets — indices, currency, commodities, and global risk gauges.
                        </p>
                    </div>
                    {latest && (
                        <div className="text-right shrink-0">
                            <p className="text-xs text-muted-foreground">Last updated</p>
                            <p className="text-sm font-medium text-white">{formatDate(latest.snapshotDate)}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Updates weekly</p>
                        </div>
                    )}
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-24">
                        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                )}

                {/* Empty state */}
                {!loading && snapshots.length === 0 && (
                    <Card className="bg-white/5 border-white/10">
                        <CardContent className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                            <span className="text-4xl">📡</span>
                            <h3 className="font-bold text-white">No macro data yet</h3>
                            <p className="text-sm text-muted-foreground max-w-sm">
                                The first snapshot will appear after the weekly cron job runs.
                                Ask your admin to trigger a refresh.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Indicator grid */}
                {!loading && latest && (
                    <div>
                        {previous && (
                            <p className="text-xs text-muted-foreground mb-4">
                                Change vs previous snapshot ({formatDate(previous.snapshotDate)})
                            </p>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {INDICATORS.map(cfg => (
                                <IndicatorCard key={cfg.key} cfg={cfg} current={latest} prev={previous} />
                            ))}
                        </div>
                    </div>
                )}

                {/* History table */}
                {!loading && history.length > 0 && (
                    <div>
                        <h2 className="text-lg font-bold font-serif mb-4">Weekly History</h2>
                        <div className="overflow-x-auto rounded-xl border border-white/10">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/5">
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">🇮🇳 Nifty 50</th>
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">💱 USD/INR</th>
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">🥇 Gold</th>
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">🛢️ Crude</th>
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">🏛️ US 10Y</th>
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">📊 VIX</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((s, i) => (
                                        <tr key={s.id} className={cn("border-b border-white/5 hover:bg-white/5 transition-colors", i % 2 === 0 ? "" : "bg-white/[0.02]")}>
                                            <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(s.snapshotDate)}</td>
                                            <td className="px-4 py-3 text-right font-mono text-xs text-white">{s.nifty50 ? parseFloat(s.nifty50).toLocaleString("en-IN", { maximumFractionDigits: 0 }) : "—"}</td>
                                            <td className="px-4 py-3 text-right font-mono text-xs text-white">{s.usdInr ? `₹${parseFloat(s.usdInr).toFixed(2)}` : "—"}</td>
                                            <td className="px-4 py-3 text-right font-mono text-xs text-white">{s.goldUsd ? `$${parseFloat(s.goldUsd).toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "—"}</td>
                                            <td className="px-4 py-3 text-right font-mono text-xs text-white">{s.crudeOilUsd ? `$${parseFloat(s.crudeOilUsd).toFixed(2)}` : "—"}</td>
                                            <td className="px-4 py-3 text-right font-mono text-xs text-white">{s.us10yYield ? `${parseFloat(s.us10yYield).toFixed(2)}%` : "—"}</td>
                                            <td className="px-4 py-3 text-right font-mono text-xs text-white">{s.cboeVix ? parseFloat(s.cboeVix).toFixed(1) : "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Methodology note */}
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 flex gap-3">
                    <span className="text-2xl shrink-0">💡</span>
                    <div className="text-sm text-amber-200/80 space-y-1">
                        <p className="font-semibold text-amber-200">How to read this</p>
                        <p>Rising VIX = more fear in markets. Rising USD/INR = rupee weakening (negative for imports). Falling crude = lower input costs for India. Rising US 10Y yield = global risk appetite shifts.</p>
                        <p className="text-xs opacity-70 mt-2">Data sourced from yfinance (Comex, CBOE, NSE). Refreshed weekly every Sunday morning.</p>
                    </div>
                </div>

            </main>
        </div>
    );
}
