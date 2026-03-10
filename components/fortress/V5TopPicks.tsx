
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
    const [view, setView] = useState<"picks" | "active" | "index" | "discovery">("picks");
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanStatus, setScanStatus] = useState("");
    const [lastScanResult, setLastScanResult] = useState<any>(null);

    const runFullScan = async () => {
        setIsScanning(true);
        setScanProgress(0);
        setScanStatus("Initializing scan...");

        try {
            const response = await fetch("/api/scan/run", { method: "POST" });
            if (!response.ok) throw new Error("Already scanning or server error");

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) return;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split("\n\n");

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const data = JSON.parse(line.replace("data: ", ""));
                        if (data.type === "start") {
                            setScanStatus(`Scanning ${data.total} stocks...`);
                        } else if (data.type === "progress") {
                            setScanProgress(data.progress);
                            setScanStatus(`Analyzing ${data.symbol}... (Score: ${data.score})`);
                        } else if (data.type === "complete") {
                            setScanStatus("Scan complete!");
                            setLastScanResult(data);
                            setIsScanning(false);
                            toast.success("Market scan completed successfully!");
                        } else if (data.type === "error") {
                            throw new Error(data.message);
                        }
                    }
                }
            }
        } catch (error: any) {
            toast.error(`Scan failed: ${error.message}`);
            setIsScanning(false);
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-wrap gap-2">
                {[
                    { id: "picks", label: "Top 8 Picks", icon: Star },
                    { id: "active", label: "Active MFs", icon: BarChart3 },
                    { id: "index", label: "Index Funds", icon: TrendingUp },
                    { id: "discovery", label: "Intelligent Scanner", icon: Search },
                ].map((t) => (
                    <Button
                        key={t.id}
                        variant={view === t.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setView(t.id as any)}
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

            {view === "discovery" && (
                <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-white/10 overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                                        <ShieldCheck className="h-6 w-6 text-emerald-400" />
                                        BSE/NSE 5-Layer Scanner
                                    </CardTitle>
                                    <p className="text-slate-400 mt-2 max-w-xl text-sm leading-relaxed">
                                        Automated fundamental screening across 2,000+ NSE stocks. Scans for
                                        <span className="text-emerald-400 font-medium"> L1-Protection</span>,
                                        <span className="text-blue-400 font-medium"> L2-Pricing</span>,
                                        <span className="text-amber-400 font-medium"> L3-Macro</span>, and
                                        <span className="text-purple-400 font-medium"> L4-Growth</span>.
                                        Results are filtered: <span className="text-white">Score &lt; 60</span> goes to the Offline List.
                                    </p>
                                </div>
                                <Button
                                    size="lg"
                                    onClick={runFullScan}
                                    disabled={isScanning}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold h-12 px-8 transition-all shrink-0"
                                >
                                    {isScanning ? <RefreshCw className="h-5 w-5 mr-2 animate-spin" /> : <Activity className="h-5 w-5 mr-2" />}
                                    {isScanning ? "Scanning Market..." : "Run Full Scan"}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-4">
                            {isScanning && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-emerald-400 font-medium">{scanStatus}</span>
                                        <span className="text-slate-400">{scanProgress}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 transition-all duration-300"
                                            style={{ width: `${scanProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest text-center mt-4">
                                        Note: Full scan takes ~5-15 mins based on Yahoo Finance latencies.
                                    </p>
                                </div>
                            )}

                            {!isScanning && !lastScanResult && (
                                <div className="p-12 border border-dashed border-white/10 rounded-xl text-center bg-white/2">
                                    <Search className="h-10 w-10 text-slate-600 mx-auto mb-4" />
                                    <h4 className="text-slate-300 font-medium">No active scan data</h4>
                                    <p className="text-slate-500 text-xs mt-2">Trigger a scan to analyze real-time market data across all NSE stocks.</p>
                                </div>
                            )}

                            {!isScanning && lastScanResult && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in zoom-in-95 duration-500">
                                    {[
                                        { label: "52W Low (Quality)", val: "Top 50", sub: "Score > 65", color: "text-emerald-400" },
                                        { label: "Penny (Qualified)", val: "Top 30", sub: "Price < ₹100", color: "text-blue-400" },
                                        { label: "Speculative", val: "Top 25", sub: "Price < ₹20", color: "text-amber-400" },
                                    ].map(stat => (
                                        <div key={stat.label} className="p-6 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                            <h5 className="text-[11px] uppercase tracking-widest text-slate-500 mb-2">{stat.label}</h5>
                                            <div className={cn("text-2xl font-bold font-mono", stat.color)}>{stat.val}</div>
                                            <div className="text-[10px] text-slate-400 mt-1">{stat.sub}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {lastScanResult?.newCount !== undefined && (
                        <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Activity className="h-4 w-4 text-amber-500" />
                                <span className="text-xs text-amber-200/80">
                                    Historical deltas:
                                    <span className="font-bold text-emerald-400 mx-1">{lastScanResult.newCount} NEW</span> entries and
                                    <span className="font-bold text-red-400 mx-1">{lastScanResult.droppedCount} EXITS</span> since last scan.
                                </span>
                            </div>
                            <Button variant="link" size="sm" className="text-amber-500 text-xs h-auto p-0">View Changes</Button>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}
