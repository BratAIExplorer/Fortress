"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Radar, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogTradeModal } from "@/components/LogTradeModal";
import { ResearchDisclaimer } from "@/components/fortress/ResearchDisclaimer";
import { scoreFundamentals } from "@/lib/momentum/score";

interface MacdSignal {
    id: string;
    timeframe: string;
    symbol: string;
    cmp: string;
    crossoverDate: string;
    daysSinceCrossover: number;
    quantity: number;
    investedAmount: string;
    firstTargetPrice: string | null;
    finalTargetPrice: string | null;
    stopLossPrice: string | null;
    riskAmount: string | null;
    fundamentals: { pe: number | null; debtToEquity: number | null; revGrowth: number | null } | null;
}

interface SignalsResponse {
    signals: MacdSignal[];
    lastUpdated?: string;
}

interface TrackRecordBucket {
    total: number;
    open: number;
    hitT1: number;
    hitT2: number;
    stopped: number;
    resolved: number;
    winRate: number | null;
    avgDaysToResolve: number | null;
}

interface ResolvedSignal {
    id: string;
    timeframe: string;
    symbol: string;
    entryCmp: string;
    firstTargetPrice: string | null;
    finalTargetPrice: string | null;
    stopLossPrice: string | null;
    status: string;
    firstSeenAt: string;
    resolvedAt: string | null;
}

interface TrackRecordResponse {
    overall: TrackRecordBucket;
    daily: TrackRecordBucket;
    weekly: TrackRecordBucket;
    recentResolved: ResolvedSignal[];
}

const STATUS_LABEL: Record<string, { text: string; className: string }> = {
    hit_t1: { text: "Hit T1", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    hit_t2: { text: "Hit T2", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    stopped: { text: "Stopped", className: "bg-red-500/20 text-red-400 border-red-500/30" },
};

type FetchState = "loading" | "ok" | "error";

function money(v: string | null) {
    if (v == null) return "—";
    return `₹${parseFloat(v).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

// ponytail: plain text, not a component — three numbers, not worth abstracting.
function fundamentalsLabel(f: MacdSignal["fundamentals"]) {
    if (!f || f.pe == null) return null;
    const parts = [`PE ${f.pe.toFixed(1)}`];
    if (f.debtToEquity != null) parts.push(`D/E ${f.debtToEquity.toFixed(0)}`);
    if (f.revGrowth != null) parts.push(`Rev ${(f.revGrowth * 100).toFixed(0)}%`);
    return parts.join(" · ");
}

const SCORE_COLOR: Record<number, string> = {
    5: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    4: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    3: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
    2: "bg-orange-500/15 text-orange-400 border-orange-500/25",
    1: "bg-red-500/15 text-red-400 border-red-500/25",
};

// ponytail: sign-in/trial gating disabled for now (see route.ts) — tab is
// open to everyone with live data until auth+SMTP is fixed.
export default function MomentumRadarPage() {
    const [signals, setSignals] = useState<MacdSignal[]>([]);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [state, setState] = useState<FetchState>("loading");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSignal, setSelectedSignal] = useState<MacdSignal | null>(null);
    const [trackRecord, setTrackRecord] = useState<TrackRecordResponse | null>(null);

    useEffect(() => {
        fetch("/api/analysis/momentum-signals")
            .then(async (res) => {
                if (!res.ok) return setState("error");
                const data: SignalsResponse = await res.json();
                setSignals(data.signals ?? []);
                setLastUpdated(data.lastUpdated ?? null);
                setState("ok");
            })
            .catch(() => setState("error"));

        // Track record is a nice-to-have summary — a failure here shouldn't
        // block the signals table above from rendering.
        fetch("/api/analysis/momentum-track-record")
            .then(async (res) => {
                if (!res.ok) return;
                const data = await res.json();
                setTrackRecord(data);
            })
            .catch(() => {});
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <main className="container max-w-6xl mx-auto px-4 sm:px-8 py-12 space-y-8">
                <div>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 mb-3">Technical Signals</Badge>
                    <h1 className="text-3xl sm:text-4xl font-bold font-serif flex items-center gap-2">
                        <Radar className="h-7 w-7 text-blue-400" /> Momentum Radar
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-lg">
                        Dual-timeframe momentum scan across Nifty 500 — daily and weekly bullish signals in a confirmed uptrend, with targets and stop loss.
                    </p>
                </div>

                {/* Status Bar: Last Scan Time + Admin Access */}
                <div className="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-blue-600/20 to-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                        {lastUpdated ? (
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-white">Last Bot Run</span>
                                <span className="text-lg font-mono text-emerald-400">
                                    {new Date(lastUpdated).toLocaleString("en-IN", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        second: "2-digit",
                                        hour12: true
                                    })}
                                </span>
                            </div>
                        ) : (
                            <span className="text-sm text-muted-foreground">Never scanned yet</span>
                        )}
                    </div>
                    <a
                        href="/momentum-radar/admin"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
                    >
                        Admin Access →
                    </a>
                </div>

                {trackRecord && trackRecord.overall.resolved > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <Card className="bg-white/5 border-white/10">
                            <CardContent className="py-4 px-4">
                                <div className="text-xs text-muted-foreground uppercase tracking-wider">Win Rate</div>
                                <div className="text-2xl font-bold text-emerald-400 font-mono">
                                    {trackRecord.overall.winRate != null ? `${(trackRecord.overall.winRate * 100).toFixed(0)}%` : "—"}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">{trackRecord.overall.resolved} resolved</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/5 border-white/10">
                            <CardContent className="py-4 px-4">
                                <div className="text-xs text-muted-foreground uppercase tracking-wider">Hit Target</div>
                                <div className="text-2xl font-bold text-white font-mono">
                                    {trackRecord.overall.hitT1 + trackRecord.overall.hitT2}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {trackRecord.overall.hitT1} T1 · {trackRecord.overall.hitT2} T2
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/5 border-white/10">
                            <CardContent className="py-4 px-4">
                                <div className="text-xs text-muted-foreground uppercase tracking-wider">Stopped Out</div>
                                <div className="text-2xl font-bold text-red-400 font-mono">{trackRecord.overall.stopped}</div>
                                <div className="text-xs text-muted-foreground mt-1">{trackRecord.overall.open} still open</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/5 border-white/10">
                            <CardContent className="py-4 px-4">
                                <div className="text-xs text-muted-foreground uppercase tracking-wider">Avg Days to Resolve</div>
                                <div className="text-2xl font-bold text-white font-mono">
                                    {trackRecord.overall.avgDaysToResolve != null ? trackRecord.overall.avgDaysToResolve.toFixed(1) : "—"}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    Daily {trackRecord.daily.resolved} · Weekly {trackRecord.weekly.resolved}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {trackRecord && trackRecord.recentResolved.length > 0 && (
                  <>
                    <p className="text-xs text-muted-foreground -mb-2">
                        <span className="inline-flex items-center gap-1"><Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">Hit T1</Badge> price reached the Target 1 column</span>
                        {" · "}
                        <span className="inline-flex items-center gap-1"><Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">Hit T2</Badge> reached the Final Target column</span>
                        {" · "}
                        <span className="inline-flex items-center gap-1"><Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">Stopped</Badge> hit the Stop Loss column first</span>
                    </p>
                    <div className="overflow-x-auto rounded-xl border border-white/10">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Symbol</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timeframe</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Result</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Entry</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Resolved</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trackRecord.recentResolved.map((r, i) => {
                                    const label = STATUS_LABEL[r.status] ?? { text: r.status, className: "" };
                                    return (
                                        <tr key={r.id} className={cn("border-b border-white/5 hover:bg-white/5 transition-colors", i % 2 === 0 ? "" : "bg-white/[0.02]")}>
                                            <td className="px-4 py-3 font-semibold text-white">{r.symbol}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline" className="text-xs">{r.timeframe}</Badge>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge className={cn("text-xs", label.className)}>{label.text}</Badge>
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono text-xs text-white">{money(r.entryCmp)}</td>
                                            <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                                                {r.resolvedAt
                                                    ? new Date(r.resolvedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
                                                    : "—"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                  </>
                )}

                {state === "loading" && (
                    <div className="flex items-center justify-center py-24">
                        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                )}

                {state === "error" && (
                    <Card className="bg-white/5 border-white/10">
                        <CardContent className="py-20 text-center text-sm text-muted-foreground">
                            Couldn&apos;t load signals. Try refreshing.
                        </CardContent>
                    </Card>
                )}

                {state === "ok" && signals.length === 0 && (
                    <Card className="bg-white/5 border-white/10">
                        <CardContent className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                            <span className="text-4xl">📡</span>
                            <h3 className="font-bold text-white">No active crossovers right now</h3>
                            <p className="text-sm text-muted-foreground max-w-sm">
                                The scanner runs every 5 minutes during market hours. Check back soon.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {state === "ok" && signals.length > 0 && (
                    <div className="overflow-x-auto rounded-xl border border-white/10">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Symbol</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timeframe</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">CMP</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Target 1</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Final Target</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Stop Loss</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Crossover</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {signals.map((s, i) => (
                                    <tr key={s.id} className={cn("border-b border-white/5 hover:bg-white/5 transition-colors", i % 2 === 0 ? "" : "bg-white/[0.02]")}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-semibold text-white">{s.symbol}</span>
                                                {scoreFundamentals(s.fundamentals) != null && (
                                                    <span
                                                        title="Fundamentals score (1-5) — see legend below the table"
                                                        className={cn(
                                                            "inline-flex items-center justify-center h-4 min-w-4 px-1 rounded text-[10px] font-bold border",
                                                            SCORE_COLOR[scoreFundamentals(s.fundamentals) as number]
                                                        )}
                                                    >
                                                        {scoreFundamentals(s.fundamentals)}
                                                    </span>
                                                )}
                                            </div>
                                            {fundamentalsLabel(s.fundamentals) && (
                                                <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                                                    {fundamentalsLabel(s.fundamentals)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant="outline" className="text-xs">{s.timeframe}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-xs text-white">{money(s.cmp)}</td>
                                        <td className="px-4 py-3 text-right font-mono text-xs text-emerald-400">{money(s.firstTargetPrice)}</td>
                                        <td className="px-4 py-3 text-right font-mono text-xs text-emerald-400">{money(s.finalTargetPrice)}</td>
                                        <td className="px-4 py-3 text-right font-mono text-xs text-red-400">{money(s.stopLossPrice)}</td>
                                        <td className="px-4 py-3 text-right text-xs text-muted-foreground">{s.crossoverDate} ({s.daysSinceCrossover}d ago)</td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => {
                                                    setSelectedSignal(s);
                                                    setModalOpen(true);
                                                }}
                                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded text-xs font-medium transition"
                                            >
                                                <LogIn size={14} />
                                                Log
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {state === "ok" && signals.length > 0 && (
                    <Card className="bg-white/5 border-white/10">
                        <CardContent className="py-4 px-4">
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Fundamentals Score Legend
                            </div>
                            <div className="flex flex-wrap gap-3 mb-3">
                                {[5, 4, 3, 2, 1].map((n) => (
                                    <span
                                        key={n}
                                        className={cn(
                                            "inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs border",
                                            SCORE_COLOR[n]
                                        )}
                                    >
                                        <span className="font-bold">{n}</span>
                                        {n === 5 && "Excellent"}
                                        {n === 4 && "Good"}
                                        {n === 3 && "Fair"}
                                        {n === 2 && "Weak"}
                                        {n === 1 && "Poor"}
                                    </span>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Average of up to 3 sub-scores (whichever fields Yahoo Finance has) — missing fields
                                are skipped, not counted against the score:
                            </p>
                            <ul className="text-xs text-muted-foreground mt-1.5 space-y-0.5 list-disc list-inside">
                                <li><span className="text-white font-medium">PE ratio</span> (cheaper = higher score): ≤15 → 5, ≤25 → 4, ≤40 → 3, ≤60 → 2, above → 1</li>
                                <li><span className="text-white font-medium">Debt/Equity</span> (less leverage = higher score): ≤25 → 5, ≤50 → 4, ≤100 → 3, ≤250 → 2, above → 1</li>
                                <li><span className="text-white font-medium">Revenue growth</span> (faster = higher score): ≥40% → 5, ≥25% → 4, ≥15% → 3, ≥0% → 2, negative → 1</li>
                            </ul>
                        </CardContent>
                    </Card>
                )}

                <ResearchDisclaimer variant="signals" />

                <div className="text-right">
                    <a href="/momentum-radar/admin" className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
                        Admin →
                    </a>
                </div>
            </main>

            {selectedSignal && (
                <LogTradeModal
                    symbol={selectedSignal.symbol}
                    timeframe={selectedSignal.timeframe}
                    open={modalOpen}
                    onClose={() => {
                        setModalOpen(false);
                        setSelectedSignal(null);
                    }}
                    onSuccess={() => {
                        // Refresh signals to show updated data
                        fetch("/api/analysis/momentum-signals")
                            .then(async (res) => {
                                if (res.ok) {
                                    const data: SignalsResponse = await res.json();
                                    setSignals(data.signals ?? []);
                                }
                            })
                            .catch(() => {});
                    }}
                />
            )}
        </div>
    );
}
