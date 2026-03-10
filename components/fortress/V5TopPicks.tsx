
"use client";

import { useState } from "react";
import { MutualFund, IndexFund, TopPick } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, BarChart3, TrendingUp, Info, Search, ShieldCheck, Activity, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface V5TopPicksProps {
    picks: TopPick[];
    mutualFunds: MutualFund[];
    indexFunds: IndexFund[];
}

export function V5TopPicks({ picks, mutualFunds, indexFunds }: V5TopPicksProps) {
    const [view, setView] = useState<"picks" | "active" | "index">("picks");

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-wrap gap-2">
                {[
                    { id: "picks", label: "Top 8 Picks", icon: Star },
                    { id: "active", label: "Active MFs", icon: BarChart3 },
                    { id: "index", label: "Index Funds", icon: TrendingUp },
                ].map((t) => (
                    <Button
                        key={t.id}
                        variant={view === t.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setView(t.id as "picks" | "active" | "index")}
                        className={cn(
                            "h-9 px-4 transition-all",
                            view === t.id ? "bg-amber-500 hover:bg-amber-600 text-black font-bold" : "border-white/10 hover:bg-white/5"
                        )}
                    >
                        <t.icon className="h-4 w-4 mr-2" />
                        {t.label}
                    </Button>
                ))}
            </div>

            {view === "picks" && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-500/5 border border-amber-500/10">
                        <Info className="h-5 w-5 text-amber-500 shrink-0" />
                        <p className="text-sm text-amber-200/80">
                            Top 8 stocks from the full Fortress scan — all scored 80/100, passed all 5 layers, currently trading below 52-week highs.
                        </p>
                    </div>

                    <div className="grid gap-4">
                        {picks.map((s, i) => (
                            <Card key={s.symbol} className="bg-white/5 border-white/10 overflow-hidden group hover:border-amber-500/30 transition-all">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row items-stretch">
                                        <div className="bg-amber-500/10 border-r border-white/5 px-6 py-4 flex items-center justify-center min-w-[80px]">
                                            <span className="text-3xl font-serif font-bold text-amber-500">#{i + 1}</span>
                                        </div>
                                        <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center gap-6">
                                            <div className="min-w-[180px]">
                                                <h3 className="text-xl font-bold text-white font-mono group-hover:text-amber-500 transition-colors">{s.symbol}</h3>
                                                <p className="text-sm text-muted-foreground">{s.name} · {s.sector}</p>
                                            </div>

                                            <div className="flex flex-wrap gap-6">
                                                {[
                                                    { label: "Score", val: `${s.score}/100`, col: "text-emerald-400" },
                                                    { label: "ROCE", val: `${s.roce}%`, col: "text-blue-400" },
                                                    { label: "D/E", val: s.de, col: "text-slate-400" }
                                                ].map(m => (
                                                    <div key={m.label} className="text-center">
                                                        <div className={cn("text-lg font-mono font-bold", m.col)}>{m.val}</div>
                                                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{m.label}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex-1">
                                                <Badge variant="outline" className="mb-2 text-[10px] border-amber-500/30 text-amber-500 uppercase">{s.tag}</Badge>
                                                <p className="text-xs text-slate-300 leading-relaxed italic">&ldquo;{s.why}&rdquo;</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {view === "active" && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                        <Info className="h-5 w-5 text-blue-500 shrink-0" />
                        <p className="text-sm text-blue-200/80">
                            Top performing active mutual funds. Past performance does not guarantee future results. Data as of March 2026.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {mutualFunds.map((mf) => (
                            <Card key={mf.name} className="bg-white/5 border-white/10 hover:border-blue-500/30 transition-all border-l-4 border-l-blue-500">
                                <CardHeader className="p-6 pb-2">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <CardTitle className="text-lg text-white">{mf.name}</CardTitle>
                                            <p className="text-xs text-muted-foreground mt-1">{mf.amc} · <span className="text-blue-400 font-medium">{mf.category}</span></p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="text-right">
                                                <div className="text-lg font-mono font-bold text-emerald-400">{mf.cagr5y}%</div>
                                                <div className="text-[9px] uppercase tracking-tighter text-muted-foreground">5Y CAGR</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-mono font-bold text-amber-500">{mf.cagr3y}%</div>
                                                <div className="text-[9px] uppercase tracking-tighter text-muted-foreground">3Y CAGR</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 pt-4 space-y-4">
                                    <div className="flex flex-wrap gap-3">
                                        {[
                                            { label: "AUM", val: mf.aum },
                                            { label: "Min SIP", val: mf.minSIP },
                                            { label: "Risk", val: mf.risk }
                                        ].map(m => (
                                            <div key={m.label} className="px-3 py-1.5 rounded-md bg-white/5 border border-white/5 text-[11px]">
                                                <span className="text-muted-foreground mr-1.5">{m.label}:</span>
                                                <span className="text-slate-200 font-medium">{m.val}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed italic">{mf.why}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}
