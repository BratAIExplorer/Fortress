"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/fortress/Navbar";
import {
    TrendingUp, TrendingDown, Target, Brain, BarChart3, Zap,
    AlertCircle, CheckCircle2, Clock, RefreshCw, Trophy, Skull
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type DashboardData = {
    summary: {
        totalPredictions: number;
        total90dChecked: number;
        overallHitRate: string;
        avgReturn90d: string;
        totalScans: number;
    };
    performance: {
        hitRateByMarket: Record<string, { hitRate: string; picks: number }>;
        hitRateByTier: Record<string, { hitRate: string; picks: number }>;
        topPicks: PickData[];
        worstPicks: PickData[];
    };
    model: {
        currentWeights: Record<string, number>;
        weightHistory: Array<{ date: string; weights: Record<string, number>; reason: string }>;
        latestInsight: {
            cycleId: string;
            generatedAt: string;
            overallHitRate: string;
            summary: string;
            recommendations: Record<string, number>;
        } | null;
    };
    recentScans: Array<{
        id: string;
        scanDate: string;
        markets: string[];
        riskMode: string;
        totalPicks: number;
    }>;
};

type PickData = {
    ticker: string;
    market: string;
    tier: string | null;
    gemScore: number | null;
    return: string | null;
    checkedAt: string | null;
    entryPrice: string | null;
    thesis: string | null;
};

// ─── Tier colours ─────────────────────────────────────────────────────────────
const TIER_STYLE: Record<string, string> = {
    Diamond: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    Sapphire: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    Emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    Quartz: "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

const RISK_STYLE: Record<string, string> = {
    conservative: "text-blue-400",
    balanced: "text-amber-400",
    aggressive: "text-rose-400",
};

// ─── Animated score ring ──────────────────────────────────────────────────────
function ScoreRing({ pct, label, color }: { pct: number; label: string; color: string }) {
    const r = 36;
    const circumference = 2 * Math.PI * r;
    const dash = circumference * (pct / 100);

    return (
        <div className="flex flex-col items-center gap-2">
            <svg width="90" height="90" viewBox="0 0 90 90">
                <circle cx="45" cy="45" r={r} fill="none" stroke="#1e293b" strokeWidth="6" />
                <circle
                    cx="45" cy="45" r={r}
                    fill="none" stroke={color} strokeWidth="6"
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeLinecap="round"
                    strokeDashoffset={circumference / 4}
                    style={{ transition: "stroke-dasharray 1s ease" }}
                />
                <text x="45" y="49" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
                    {pct}%
                </text>
            </svg>
            <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{label}</span>
        </div>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function AlphaDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [adminSecret, setAdminSecret] = useState("");
    const [secretInput, setSecretInput] = useState("");

    const fetchDashboard = async (secret: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/alpha/dashboard", {
                headers: { "x-admin-secret": secret },
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Unauthorized");
            }
            const json = await res.json();
            setData(json);
            setAdminSecret(secret);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to load dashboard");
        } finally {
            setLoading(false);
        }
    };

    // Auto-check sessionStorage for cached secret
    useEffect(() => {
        const cached = sessionStorage.getItem("fortress_admin_secret");
        if (cached) fetchDashboard(cached);
        else setLoading(false);
    }, []);

    const handleLogin = () => {
        sessionStorage.setItem("fortress_admin_secret", secretInput);
        fetchDashboard(secretInput);
    };

    // ── Auth gate ──────────────────────────────────────────────────────────────
    if (!adminSecret && !loading) {
        return (
            <div className="flex flex-col min-h-screen pt-16">
                {/* Navbar provided by layout */}
                <div className="flex flex-1 items-center justify-center px-4">
                    <div className="w-full max-w-sm space-y-6">
                        <div className="text-center">
                            <Brain className="mx-auto mb-3 h-10 w-10 text-primary" />
                            <h1 className="text-2xl font-bold">Alpha Dashboard</h1>
                            <p className="text-sm text-muted-foreground mt-1">Sovereign Intelligence Engine — Admin Only</p>
                        </div>
                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}
                        <div className="space-y-3">
                            <input
                                type="password"
                                placeholder="Admin secret"
                                value={secretInput}
                                onChange={(e) => setSecretInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <button
                                onClick={handleLogin}
                                className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                            >
                                Access Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen pt-16">
                {/* Navbar provided by layout */}
                <div className="flex flex-1 items-center justify-center">
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span>Loading intelligence data...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col min-h-screen pt-16">
                {/* Navbar provided by layout */}
                <div className="flex flex-1 items-center justify-center text-destructive">
                    {error || "No data"}
                </div>
            </div>
        );
    }

    const { summary, performance, model, recentScans } = data;

    return (
        <div className="flex flex-col min-h-screen pt-16">
            {/* Navbar provided by layout */}

            <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl space-y-8">

                {/* ── Header ── */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Alpha Performance</h1>
                        <p className="text-muted-foreground mt-1 text-sm">Self-learning prediction engine — improving with every 90-day cycle</p>
                    </div>
                    <button
                        onClick={() => fetchDashboard(adminSecret)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Refresh
                    </button>
                </div>

                {/* ── Summary KPIs ── */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <KPICard
                        label="Overall Hit Rate"
                        value={summary.overallHitRate}
                        icon={<Target className="h-4 w-4" />}
                        highlight
                    />
                    <KPICard
                        label="Avg Return (90d)"
                        value={summary.avgReturn90d}
                        icon={<TrendingUp className="h-4 w-4" />}
                    />
                    <KPICard
                        label="Picks Tracked"
                        value={String(summary.total90dChecked)}
                        icon={<BarChart3 className="h-4 w-4" />}
                    />
                    <KPICard
                        label="Total Predictions"
                        value={String(summary.totalPredictions)}
                        icon={<Brain className="h-4 w-4" />}
                    />
                    <KPICard
                        label="Scan Sessions"
                        value={String(summary.totalScans)}
                        icon={<Zap className="h-4 w-4" />}
                    />
                </div>

                {/* ── Market + Tier Performance ── */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Hit Rate by Market</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {Object.entries(performance.hitRateByMarket).length === 0
                                ? <EmptyState label="No market data yet" />
                                : Object.entries(performance.hitRateByMarket)
                                    .sort((a, b) => parseFloat(b[1].hitRate) - parseFloat(a[1].hitRate))
                                    .map(([market, d]) => (
                                        <HitRateBar key={market} label={market} rate={d.hitRate} picks={d.picks} />
                                    ))
                            }
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Hit Rate by Tier</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {Object.entries(performance.hitRateByTier).length === 0
                                ? <EmptyState label="No tier data yet" />
                                : ["Diamond", "Sapphire", "Emerald", "Quartz"]
                                    .filter((t) => performance.hitRateByTier[t])
                                    .map((tier) => {
                                        const d = performance.hitRateByTier[tier];
                                        return <HitRateBar key={tier} label={tier} rate={d.hitRate} picks={d.picks} tier={tier} />;
                                    })
                            }
                        </CardContent>
                    </Card>
                </div>

                {/* ── Top Picks + Worst Picks ── */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Trophy className="h-4 w-4 text-amber-400" />
                                Best Picks (90d)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {performance.topPicks.length === 0
                                ? <EmptyState label="No 90d data yet" />
                                : performance.topPicks.map((p, i) => <PickRow key={i} pick={p} positive />)
                            }
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Skull className="h-4 w-4 text-rose-400" />
                                Worst Picks (90d)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {performance.worstPicks.length === 0
                                ? <EmptyState label="No 90d data yet" />
                                : performance.worstPicks.map((p, i) => <PickRow key={i} pick={p} positive={false} />)
                            }
                        </CardContent>
                    </Card>
                </div>

                {/* ── Model Intelligence ── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Brain className="h-4 w-4 text-primary" />
                            Scoring Weights — Current Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-8 justify-center py-4">
                            {Object.entries(model.currentWeights).map(([key, val]) => (
                                <ScoreRing
                                    key={key}
                                    pct={val}
                                    label={key}
                                    color={key === "undervaluation" ? "#f59e0b" : key === "institutional" ? "#6366f1" : key === "fundamental" ? "#10b981" : "#f97316"}
                                />
                            ))}
                        </div>
                        {model.latestInsight && (
                            <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/10 text-sm space-y-2">
                                <div className="flex items-center gap-2 font-medium">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                    Latest Learning Report — {model.latestInsight.cycleId}
                                </div>
                                <p className="text-muted-foreground leading-relaxed">{model.latestInsight.summary}</p>
                                {model.latestInsight.recommendations && (
                                    <div className="mt-2">
                                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Recommended weights: </span>
                                        <span className="font-mono text-xs">
                                            {Object.entries(model.latestInsight.recommendations)
                                                .map(([k, v]) => `${k}: ${v}`)
                                                .join(" | ")}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                        {model.weightHistory.length > 1 && (
                            <div className="mt-4">
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Weight Evolution</p>
                                <div className="space-y-1">
                                    {model.weightHistory.slice(-5).map((h, i) => (
                                        <div key={i} className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="font-mono w-24 shrink-0">{new Date(h.date).toLocaleDateString()}</span>
                                            <span className="font-mono">{Object.entries(h.weights).map(([k, v]) => `${k[0].toUpperCase()}:${v}`).join(" ")}</span>
                                            <span className="truncate">{h.reason}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ── Recent Scans ── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Clock className="h-4 w-4" />
                            Recent Scan Sessions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentScans.length === 0
                            ? <EmptyState label="No scans recorded yet. Run the Hidden Gem Hunter skill to start." />
                            : (
                                <div className="space-y-2">
                                    {recentScans.map((s) => (
                                        <div key={s.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium">{new Date(s.scanDate!).toLocaleDateString()}</span>
                                                <div className="flex gap-1">
                                                    {(s.markets || []).map((m) => (
                                                        <Badge key={m} variant="outline" className="text-xs px-1.5 py-0">{m}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs font-medium capitalize ${RISK_STYLE[s.riskMode] || "text-muted-foreground"}`}>
                                                    {s.riskMode}
                                                </span>
                                                <span className="text-xs text-muted-foreground">{s.totalPicks} picks</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        }
                    </CardContent>
                </Card>

            </main>
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KPICard({ label, value, icon, highlight }: {
    label: string; value: string; icon: React.ReactNode; highlight?: boolean;
}) {
    return (
        <Card className={highlight ? "border-primary/30 bg-primary/5" : ""}>
            <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    {icon}
                    <span className="text-xs uppercase tracking-wider">{label}</span>
                </div>
                <div className={`text-2xl font-bold ${highlight ? "text-primary" : ""}`}>{value}</div>
            </CardContent>
        </Card>
    );
}

function HitRateBar({ label, rate, picks, tier }: {
    label: string; rate: string; picks: number; tier?: string;
}) {
    const pct = parseFloat(rate) || 0;
    return (
        <div className="space-y-1">
            <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2">
                    {tier && (
                        <Badge variant="outline" className={`text-xs px-1.5 py-0 ${TIER_STYLE[tier] || ""}`}>
                            {tier}
                        </Badge>
                    )}
                    {!tier && <span className="font-medium">{label}</span>}
                </span>
                <span className="text-muted-foreground text-xs">{rate} · {picks} picks</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                        width: `${pct}%`,
                        background: pct >= 60 ? "#10b981" : pct >= 40 ? "#f59e0b" : "#ef4444"
                    }}
                />
            </div>
        </div>
    );
}

function PickRow({ pick, positive }: { pick: PickData; positive: boolean }) {
    const ret = pick.return ? parseFloat(pick.return) : null;
    return (
        <div className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-2">
                {positive
                    ? <TrendingUp className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    : <TrendingDown className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                }
                <div>
                    <span className="font-mono font-semibold text-sm">{pick.ticker}</span>
                    <span className="text-xs text-muted-foreground ml-2">{pick.market}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {pick.tier && (
                    <Badge variant="outline" className={`text-xs px-1.5 py-0 ${TIER_STYLE[pick.tier] || ""}`}>
                        {pick.tier}
                    </Badge>
                )}
                <span className={`font-mono text-sm font-semibold ${ret && ret > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {pick.return || "—"}
                </span>
            </div>
        </div>
    );
}

function EmptyState({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-2 py-6 justify-center text-muted-foreground text-sm">
            <Clock className="h-4 w-4" />
            {label}
        </div>
    );
}
