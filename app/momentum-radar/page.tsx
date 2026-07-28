"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Radar, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

type FetchState = "loading" | "ok" | "unauthenticated" | "trial_expired" | "error";

function money(v: string | null) {
    if (v == null) return "—";
    return `₹${parseFloat(v).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export default function MomentumRadarPage() {
    const [signals, setSignals] = useState<MacdSignal[]>([]);
    const [state, setState] = useState<FetchState>("loading");

    useEffect(() => {
        fetch("/api/analysis/momentum-signals", { credentials: "include" })
            .then(async (res) => {
                if (res.status === 401) return setState("unauthenticated");
                if (res.status === 402) return setState("trial_expired");
                if (!res.ok) return setState("error");
                const data = await res.json();
                setSignals(data.signals ?? []);
                setState("ok");
            })
            .catch(() => setState("error"));
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
                        Dual-timeframe MACD crossover scan across Nifty 500 — daily and weekly bullish signals in a confirmed uptrend, with targets and stop loss.
                    </p>
                </div>

                {state === "loading" && (
                    <div className="flex items-center justify-center py-24">
                        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                )}

                {state === "unauthenticated" && (
                    <Card className="bg-white/5 border-white/10">
                        <CardContent className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                            <Lock className="h-8 w-8 text-muted-foreground" />
                            <h3 className="font-bold text-white">Sign in to view Momentum Radar</h3>
                            <p className="text-sm text-muted-foreground max-w-sm">
                                This tab is available to signed-in users only.
                            </p>
                            <a href="/login" className="text-sm text-blue-400 hover:underline mt-2">Go to login →</a>
                        </CardContent>
                    </Card>
                )}

                {state === "trial_expired" && (
                    <Card className="bg-amber-500/5 border-amber-500/20">
                        <CardContent className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                            <Lock className="h-8 w-8 text-amber-400" />
                            <h3 className="font-bold text-white">Your 30-day free trial has ended</h3>
                            <p className="text-sm text-muted-foreground max-w-sm">
                                Momentum Radar requires a registration request and subscription to continue.
                            </p>
                            <a href="mailto:bharatsamant@gmail.com?subject=Momentum%20Radar%20Access%20Request" className="text-sm text-amber-400 hover:underline mt-2">
                                Request access →
                            </a>
                        </CardContent>
                    </Card>
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
                                </tr>
                            </thead>
                            <tbody>
                                {signals.map((s, i) => (
                                    <tr key={s.id} className={cn("border-b border-white/5 hover:bg-white/5 transition-colors", i % 2 === 0 ? "" : "bg-white/[0.02]")}>
                                        <td className="px-4 py-3 font-semibold text-white">{s.symbol}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant="outline" className="text-xs">{s.timeframe}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-xs text-white">{money(s.cmp)}</td>
                                        <td className="px-4 py-3 text-right font-mono text-xs text-emerald-400">{money(s.firstTargetPrice)}</td>
                                        <td className="px-4 py-3 text-right font-mono text-xs text-emerald-400">{money(s.finalTargetPrice)}</td>
                                        <td className="px-4 py-3 text-right font-mono text-xs text-red-400">{money(s.stopLossPrice)}</td>
                                        <td className="px-4 py-3 text-right text-xs text-muted-foreground">{s.crossoverDate} ({s.daysSinceCrossover}d ago)</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}
