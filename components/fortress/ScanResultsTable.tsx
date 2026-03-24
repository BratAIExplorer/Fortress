"use client";

import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpDown, ArrowUp, ArrowDown, RefreshCw } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScanRow {
    symbol: string;
    price: string | null;
    total_score: number | null;
    category: string | null;
    market: string;
    mb_score: number | null;
    mb_tier: string | null;
    megatrend: string | null;
    megatrend_emoji: string | null;
    fcf_yield_pct: number | null;
    earnings_quality: number | null;
    peg: number | null;
    de_direction: string | null;
    margin_direction: string | null;
    cc_score: number | null;
    cc_tier: string | null;
    cc_revenue_cagr: number | null;
    cc_years_checked: number | null;
}

type SortKey = "mb_score" | "total_score" | "cc_score";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MB_TIER_CONFIG: Record<string, { emoji: string; color: string; bg: string }> = {
    Rocket:   { emoji: "🚀", color: "text-emerald-400", bg: "bg-emerald-500/20 border-emerald-500/30" },
    Launcher: { emoji: "🛸", color: "text-blue-400",    bg: "bg-blue-500/20 border-blue-500/30" },
    Builder:  { emoji: "🏗️", color: "text-amber-400",   bg: "bg-amber-500/20 border-amber-500/30" },
    Crawler:  { emoji: "🐢", color: "text-orange-400",  bg: "bg-orange-500/20 border-orange-500/30" },
    Grounded: { emoji: "⛔", color: "text-red-400",     bg: "bg-red-500/20 border-red-500/30" },
};

const DE_ARROW: Record<string, { icon: string; color: string }> = {
    falling:  { icon: "↘", color: "text-emerald-400" },
    stable:   { icon: "→", color: "text-slate-400" },
    rising:   { icon: "↗", color: "text-red-400" },
    unknown:  { icon: "–", color: "text-slate-600" },
};

const MARGIN_ARROW: Record<string, { icon: string; color: string }> = {
    expanding:   { icon: "↗", color: "text-emerald-400" },
    stable:      { icon: "→", color: "text-slate-400" },
    contracting: { icon: "↘", color: "text-red-400" },
    unknown:     { icon: "–", color: "text-slate-600" },
};

function ScoreBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
    const pct = Math.min(100, (value / max) * 100);
    return (
        <div className="flex items-center gap-2">
            <span className={cn("font-mono text-sm font-bold w-8 text-right", color)}>{value}</span>
            <div className="h-1.5 w-16 bg-white/10 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", color.replace("text-", "bg-"))} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ALL_TIERS = ["All", "Rocket", "Launcher", "Builder", "Crawler", "Grounded"];
const ALL_CC_TIERS = ["All", "Classic", "Strong", "Developing"];
const ALL_CATEGORIES = ["All", "52W_LOW", "PENNY", "SUB20"];

const CC_TIER_CONFIG: Record<string, { emoji: string; color: string; bg: string }> = {
    Classic:      { emoji: "☕", color: "text-amber-300",  bg: "bg-amber-500/20 border-amber-500/40" },
    Strong:       { emoji: "🌱", color: "text-emerald-400", bg: "bg-emerald-500/20 border-emerald-500/40" },
    Developing:   { emoji: "📈", color: "text-blue-400",   bg: "bg-blue-500/20 border-blue-500/40" },
    Inconsistent: { emoji: "📉", color: "text-slate-400",  bg: "bg-white/5 border-white/10" },
};

export function ScanResultsTable({ scanId }: { scanId?: string }) {
    const [rows, setRows] = useState<ScanRow[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [sortKey, setSortKey] = useState<SortKey>("mb_score");
    const [tierFilter, setTierFilter] = useState("All");
    const [ccTierFilter, setCcTierFilter] = useState("All");
    const [categoryFilter, setCategoryFilter] = useState("All");

    const fetchResults = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ sort: sortKey, limit: "200" });
            if (scanId) params.set("scanId", scanId);
            if (tierFilter !== "All") params.set("tier", tierFilter);
            if (ccTierFilter !== "All") params.set("cc_tier", ccTierFilter);
            if (categoryFilter !== "All") params.set("category", categoryFilter);

            const res = await fetch(`/api/scan/results?${params}`);
            if (!res.ok) throw new Error("Failed to fetch results");
            const data = await res.json();
            setRows(data.results);
            setTotal(data.total);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [scanId, sortKey, tierFilter, ccTierFilter, categoryFilter]);

    useEffect(() => { fetchResults(); }, [fetchResults]);

    const toggleSort = (key: SortKey) => {
        setSortKey(key);
    };

    const SortIcon = ({ col }: { col: SortKey }) =>
        sortKey === col
            ? <ArrowDown className="h-3 w-3 inline ml-1 text-primary" />
            : <ArrowUpDown className="h-3 w-3 inline ml-1 opacity-40" />;

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Tier filter */}
                <div className="flex gap-1.5 flex-wrap">
                    {ALL_TIERS.map(t => (
                        <button
                            key={t}
                            onClick={() => setTierFilter(t)}
                            className={cn(
                                "text-[10px] px-2.5 py-1 rounded-full border transition-all font-medium",
                                tierFilter === t
                                    ? "bg-primary/20 border-primary text-white"
                                    : "border-white/20 text-muted-foreground hover:border-white/40"
                            )}
                        >
                            {t !== "All" ? `${MB_TIER_CONFIG[t]?.emoji} ` : ""}{t}
                        </button>
                    ))}
                </div>

                <div className="h-4 w-px bg-white/10" />

                {/* Coffee Can tier filter */}
                <div className="flex gap-1.5 flex-wrap">
                    {ALL_CC_TIERS.map(t => (
                        <button
                            key={t}
                            onClick={() => setCcTierFilter(t)}
                            className={cn(
                                "text-[10px] px-2.5 py-1 rounded-full border transition-all font-medium",
                                ccTierFilter === t
                                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                                    : "border-white/20 text-muted-foreground hover:border-white/40"
                            )}
                        >
                            {t !== "All" ? `${CC_TIER_CONFIG[t]?.emoji} ` : "☕ All CC"}
                            {t !== "All" ? t : ""}
                        </button>
                    ))}
                </div>

                <div className="h-4 w-px bg-white/10" />

                {/* Category filter */}
                <div className="flex gap-1.5 flex-wrap">
                    {ALL_CATEGORIES.map(c => (
                        <button
                            key={c}
                            onClick={() => setCategoryFilter(c)}
                            className={cn(
                                "text-[10px] px-2.5 py-1 rounded-full border transition-all",
                                categoryFilter === c
                                    ? "bg-primary/20 border-primary text-white"
                                    : "border-white/20 text-muted-foreground hover:border-white/40"
                            )}
                        >
                            {c === "52W_LOW" ? "52W Low" : c === "All" ? "All Categories" : c}
                        </button>
                    ))}
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchResults}
                    disabled={loading}
                    className="ml-auto text-xs h-7 px-2"
                >
                    <RefreshCw className={cn("h-3.5 w-3.5 mr-1", loading && "animate-spin")} />
                    {loading ? "Loading…" : `${total} results`}
                </Button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Fetching scan results…
                </div>
            ) : rows.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                    No results found. Run a scan first.
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-white/10">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="text-left text-muted-foreground py-3 px-4 font-medium whitespace-nowrap">Symbol</th>
                                <th className="text-left text-muted-foreground py-3 px-4 font-medium whitespace-nowrap">Megatrend</th>
                                <th className="text-right text-muted-foreground py-3 px-4 font-medium whitespace-nowrap cursor-pointer hover:text-white"
                                    onClick={() => toggleSort("mb_score")}>
                                    MB Score <SortIcon col="mb_score" />
                                </th>
                                <th className="text-left text-muted-foreground py-3 px-4 font-medium whitespace-nowrap">Tier</th>
                                <th className="text-right text-muted-foreground py-3 px-4 font-medium whitespace-nowrap cursor-pointer hover:text-white"
                                    onClick={() => toggleSort("total_score")}>
                                    5L Score <SortIcon col="total_score" />
                                </th>
                                <th className="text-right text-muted-foreground py-3 px-4 font-medium whitespace-nowrap">FCF Yield</th>
                                <th className="text-right text-muted-foreground py-3 px-4 font-medium whitespace-nowrap">EQ Ratio</th>
                                <th className="text-right text-muted-foreground py-3 px-4 font-medium whitespace-nowrap">PEG</th>
                                <th className="text-center text-muted-foreground py-3 px-4 font-medium whitespace-nowrap">Debt</th>
                                <th className="text-center text-muted-foreground py-3 px-4 font-medium whitespace-nowrap">Margin</th>
                                <th className="text-right text-muted-foreground py-3 px-4 font-medium whitespace-nowrap cursor-pointer hover:text-white"
                                    onClick={() => toggleSort("cc_score")}>
                                    ☕ CC Score <SortIcon col="cc_score" />
                                </th>
                                <th className="text-left text-muted-foreground py-3 px-4 font-medium whitespace-nowrap">Category</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, i) => {
                                const tier = MB_TIER_CONFIG[row.mb_tier ?? ""] ?? { emoji: "–", color: "text-slate-400", bg: "bg-white/5 border-white/10" };
                                const de = DE_ARROW[row.de_direction ?? "unknown"] ?? DE_ARROW.unknown;
                                const margin = MARGIN_ARROW[row.margin_direction ?? "unknown"] ?? MARGIN_ARROW.unknown;

                                const fcfColor = row.fcf_yield_pct == null ? "text-slate-500"
                                    : row.fcf_yield_pct > 5 ? "text-emerald-400"
                                    : row.fcf_yield_pct > 2 ? "text-amber-400" : "text-slate-400";

                                const eqColor = row.earnings_quality == null ? "text-slate-500"
                                    : row.earnings_quality > 0.8 ? "text-emerald-400"
                                    : row.earnings_quality > 0.5 ? "text-amber-400" : "text-red-400";

                                const pegColor = row.peg == null ? "text-slate-500"
                                    : row.peg < 0.8 ? "text-emerald-400"
                                    : row.peg < 1.2 ? "text-amber-400"
                                    : row.peg < 2 ? "text-orange-400" : "text-red-400";

                                return (
                                    <tr
                                        key={row.symbol}
                                        className={cn(
                                            "border-b border-white/5 transition-colors hover:bg-white/5",
                                            i % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
                                        )}
                                    >
                                        {/* Symbol */}
                                        <td className="py-3 px-4">
                                            <span className="font-mono font-bold text-white">{row.symbol.replace(".NS", "").replace(".HK", "")}</span>
                                            <span className="text-muted-foreground ml-1 text-[10px]">{row.price ? `₹${Number(row.price).toFixed(0)}` : ""}</span>
                                        </td>

                                        {/* Megatrend */}
                                        <td className="py-3 px-4">
                                            {row.megatrend ? (
                                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                    {row.megatrend_emoji} {row.megatrend.length > 20 ? row.megatrend.substring(0, 20) + "…" : row.megatrend}
                                                </span>
                                            ) : <span className="text-slate-600">–</span>}
                                        </td>

                                        {/* MB Score bar */}
                                        <td className="py-3 px-4 text-right">
                                            {row.mb_score != null
                                                ? <ScoreBar value={row.mb_score} color={tier.color} />
                                                : <span className="text-slate-600">–</span>
                                            }
                                        </td>

                                        {/* MB Tier badge */}
                                        <td className="py-3 px-4">
                                            {row.mb_tier ? (
                                                <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-medium", tier.bg, tier.color)}>
                                                    {tier.emoji} {row.mb_tier}
                                                </span>
                                            ) : <span className="text-slate-600">–</span>}
                                        </td>

                                        {/* 5L Score */}
                                        <td className="py-3 px-4 text-right">
                                            <span className={cn("font-mono font-bold", (row.total_score ?? 0) >= 80 ? "text-emerald-400" : (row.total_score ?? 0) >= 60 ? "text-amber-400" : "text-red-400")}>
                                                {row.total_score ?? "–"}
                                            </span>
                                        </td>

                                        {/* FCF Yield */}
                                        <td className={cn("py-3 px-4 text-right font-mono", fcfColor)}>
                                            {row.fcf_yield_pct != null ? `${row.fcf_yield_pct.toFixed(1)}%` : "–"}
                                        </td>

                                        {/* Earnings Quality */}
                                        <td className={cn("py-3 px-4 text-right font-mono", eqColor)}>
                                            {row.earnings_quality != null ? row.earnings_quality.toFixed(2) : "–"}
                                        </td>

                                        {/* PEG */}
                                        <td className={cn("py-3 px-4 text-right font-mono", pegColor)}>
                                            {row.peg != null ? row.peg.toFixed(1) : "–"}
                                        </td>

                                        {/* Debt direction */}
                                        <td className="py-3 px-4 text-center">
                                            <span className={cn("font-bold text-base", de.color)} title={row.de_direction ?? "unknown"}>
                                                {de.icon}
                                            </span>
                                        </td>

                                        {/* Margin direction */}
                                        <td className="py-3 px-4 text-center">
                                            <span className={cn("font-bold text-base", margin.color)} title={row.margin_direction ?? "unknown"}>
                                                {margin.icon}
                                            </span>
                                        </td>

                                        {/* Coffee Can Score */}
                                        <td className="py-3 px-4 text-right">
                                            {row.cc_score != null && row.cc_tier && row.cc_tier !== "Insufficient Data" ? (() => {
                                                const cc = CC_TIER_CONFIG[row.cc_tier] ?? CC_TIER_CONFIG.Inconsistent;
                                                return (
                                                    <div className="flex flex-col items-end gap-0.5">
                                                        <span className={cn("font-mono font-bold text-sm", cc.color)}>{row.cc_score}</span>
                                                        <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full border font-medium", cc.bg, cc.color)}>
                                                            {cc.emoji} {row.cc_tier}
                                                        </span>
                                                        {row.cc_revenue_cagr != null && (
                                                            <span className="text-[9px] text-muted-foreground">Rev CAGR {row.cc_revenue_cagr.toFixed(1)}%</span>
                                                        )}
                                                    </div>
                                                );
                                            })() : <span className="text-slate-600">–</span>}
                                        </td>

                                        {/* Category */}
                                        <td className="py-3 px-4">
                                            <span className="text-[10px] text-muted-foreground">
                                                {row.category === "52W_LOW" ? "52W Low"
                                                    : row.category === "PENNY" ? "Penny"
                                                    : row.category === "SUB20" ? "Sub₹20"
                                                    : row.category ?? "–"}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-[10px] text-muted-foreground pt-1">
                <span><span className="text-emerald-400">↘ Debt</span> = D/E falling (deleveraging)</span>
                <span><span className="text-emerald-400">↗ Margin</span> = Operating margin expanding</span>
                <span><span className="text-emerald-400">EQ &gt; 0.8</span> = Earnings quality clean</span>
                <span><span className="text-emerald-400">PEG &lt; 0.8</span> = Growth underpriced</span>
                <span><span className="text-emerald-400">FCF &gt; 5%</span> = Strong cash yield</span>
                <span><span className="text-amber-300">☕ Classic</span> = Rev CAGR &gt;10% + ROCE &gt;15% for 4yr</span>
            </div>
        </div>
    );
}
