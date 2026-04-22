"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ShieldCheck, Activity, RefreshCw, BarChart3, TrendingUp, Shield, CheckCircle2, Table2, Scale, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ScanResultsTable } from "@/components/fortress/ScanResultsTable";

interface ScanResult {
    type: "complete";
    scanId: string;
    newCount: number;
    droppedCount: number;
    deltas: Record<string, unknown>;
}

type ScannerView = "summary" | "results";

export function V5MarketScanner() {
    const router = useRouter();
    const { data: session, status: sessionStatus } = useSession();
    const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin ?? false;

    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanStatus, setScanStatus] = useState("");
    const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null);
    const [view, setView] = useState<ScannerView>("summary");
    const [cooldown, setCooldown] = useState<{ minutes: number; nextAllowedAt: string } | null>(null);

    // 1. Sync with server state on mount
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await fetch("/api/scan/run");
                const data = await res.json();

                if (data.status === "RUNNING") {
                    setIsScanning(true);
                    setScanStatus(`Resuming active scan... (${data.currentCount} analysed)`);
                    if (data.progress) setScanProgress(data.progress);
                    connectToSSE();
                } else if (data.status === "COMPLETED") {
                    setLastScanResult({
                        type: "complete",
                        scanId: data.id,
                        newCount: data.totalScanned || 0,
                        droppedCount: 0,
                        deltas: {}
                    });
                    // Check if we're still in cooldown from this scan
                    const COOLDOWN_MS = 4 * 60 * 60 * 1000;
                    if (data.runAt) {
                        const elapsed = Date.now() - new Date(data.runAt).getTime();
                        if (elapsed < COOLDOWN_MS) {
                            const remainingMs = COOLDOWN_MS - elapsed;
                            setCooldown({
                                minutes: Math.ceil(remainingMs / 60000),
                                nextAllowedAt: new Date(Date.now() + remainingMs).toISOString()
                            });
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to check scan status", e);
            }
        };

        checkStatus();
    }, []);

    const connectToSSE = async () => {
        try {
            const response = await fetch("/api/scan/run", { method: "POST" });
            if (response.status === 409) {
                // If already scanning, the POST returns 409, but we can't easily "join" a stream.
                // In a production app, we'd use WebSockets or persistent SSE.
                // For now, we'll poll the GET endpoint every 5 seconds if 409 happens.
                const poll = setInterval(async () => {
                    const res = await fetch("/api/scan/run");
                    const data = await res.json();
                    if (data.status === "RUNNING") {
                        setScanStatus(`Scanning market... (${data.currentCount} found)`);
                        if (data.progress) setScanProgress(data.progress);
                    } else {
                        setIsScanning(false);
                        clearInterval(poll);
                        toast.success("Background scan finished. Refresh to see totals.");
                    }
                }, 5000);
                return;
            }
            if (response.status === 429) {
                const body = await response.json().catch(() => ({}));
                setCooldown({ minutes: body.cooldownMinutes ?? 240, nextAllowedAt: body.nextAllowedAt });
                setIsScanning(false);
                toast.error(`Scan cooldown: ${body.cooldownMinutes ?? "~240"} min remaining. yfinance needs time to reset.`);
                return;
            }
            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.error ?? `Server error (${response.status})`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) return;

            setIsScanning(true);

            // Buffer accumulates bytes across chunks so SSE messages that span
            // multiple TCP packets are never partially parsed.
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // SSE messages are delimited by double newline
                const parts = buffer.split("\n\n");
                // The last element may be an incomplete message — keep it in buffer
                buffer = parts.pop() ?? "";

                for (const part of parts) {
                    const line = part.trim();
                    if (!line.startsWith("data: ")) continue;
                    const data = JSON.parse(line.slice(6));
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
                        // Refresh server component data so 52W Low, Sub-₹20,
                        // and Penny tabs pick up the new scan results immediately.
                        router.refresh();
                    } else if (data.type === "error") {
                        throw new Error(data.message);
                    }
                }
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error occurred";
            toast.error(`Scan failed: ${message}`);
            setIsScanning(false);
        }
    };

    const runFullScan = () => connectToSSE();

    // Non-admin users: show an informational panel instead of a broken scan button
    if (sessionStatus !== "loading" && !isAdmin) {
        return (
            <div className="space-y-8">
                {/* Legend Section */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {[
                        { id: "L1", label: "Protection", icon: Shield, col: "text-emerald-400", desc: "D/E < 0.6 & OCF+" },
                        { id: "L2", label: "Pricing", icon: BarChart3, col: "text-blue-400", desc: "Margins + ROCE > 20%" },
                        { id: "L3", label: "Momentum", icon: Activity, col: "text-amber-400", desc: "3M/6M/1Y vs Nifty 50" },
                        { id: "L4", label: "Growth", icon: TrendingUp, col: "text-purple-400", desc: "EPS & Revenue CAGR" },
                        { id: "L5", label: "Ownership", icon: CheckCircle2, col: "text-rose-400", desc: "Insider + FII Holding" },
                        { id: "L6", label: "Valuation", icon: Scale, col: "text-violet-400", desc: "No Bubble — P/E & PEG" },
                    ].map(layer => (
                        <Card key={layer.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-help group">
                            <CardContent className="p-4 flex flex-col items-center text-center">
                                <layer.icon className={cn("h-6 w-6 mb-2", layer.col)} />
                                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">{layer.id}</span>
                                <h4 className="text-xs font-bold text-white mb-1">{layer.label}</h4>
                                <p className="text-[9px] text-slate-400 leading-tight opacity-0 group-hover:opacity-100 transition-opacity">{layer.desc}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-white/10 overflow-hidden text-slate-200">
                    <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                            <ShieldCheck className="h-6 w-6 text-emerald-400" />
                            BSE/NSE 5-Layer Scanner
                        </CardTitle>
                        <p className="text-slate-400 mt-2 max-w-xl text-sm leading-relaxed">
                            Automated fundamental screening across 2,000+ NSE stocks using 6 proprietary layers.
                        </p>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                        <div className="p-8 rounded-xl border border-white/10 bg-white/3 text-center space-y-4">
                            <div className="flex justify-center">
                                <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                    <Clock className="h-8 w-8 text-emerald-400" />
                                </div>
                            </div>
                            <h4 className="text-slate-200 font-semibold text-lg">Scanner Runs Automatically</h4>
                            <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                                The Intelligent Scanner runs on a scheduled basis and refreshes results across all NSE stocks.
                                Fresh scan results are reflected in the <span className="text-amber-400 font-medium">52W Lows</span>, <span className="text-blue-400 font-medium">Qualified Penny</span>, and <span className="text-amber-400 font-medium">Sub-₹20 Spec</span> tabs above.
                            </p>
                            <p className="text-slate-500 text-xs mt-2">
                                Manual scan triggers are reserved for administrators.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* View toggle */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setView("summary")}
                    className={cn(
                        "flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition-all",
                        view === "summary"
                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                            : "border-white/10 text-muted-foreground hover:bg-white/5"
                    )}
                >
                    <Activity className="h-4 w-4" /> Scanner
                </button>
                <button
                    onClick={() => setView("results")}
                    className={cn(
                        "flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition-all",
                        view === "results"
                            ? "bg-primary/20 border-primary/40 text-primary"
                            : "border-white/10 text-muted-foreground hover:bg-white/5"
                    )}
                >
                    <Table2 className="h-4 w-4" /> Live Results
                    {lastScanResult && (
                        <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                            {lastScanResult.newCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Results view */}
            {view === "results" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-white">Scan Results</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Sorted by Multi-Bagger Score. Click column headers to re-sort.
                            </p>
                        </div>
                    </div>
                    <ScanResultsTable key={lastScanResult?.scanId ?? "latest"} scanId={lastScanResult?.scanId} />
                </div>
            )}

            {view === "summary" && (
            <div className="space-y-12">
            {/* Legend Section first for clarity */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {[
                    { id: "L1", label: "Protection", icon: Shield, col: "text-emerald-400", desc: "D/E < 0.6 & OCF+" },
                    { id: "L2", label: "Pricing", icon: BarChart3, col: "text-blue-400", desc: "Margins + ROCE > 20%" },
                    { id: "L3", label: "Momentum", icon: Activity, col: "text-amber-400", desc: "3M/6M/1Y vs Nifty 50" },
                    { id: "L4", label: "Growth", icon: TrendingUp, col: "text-purple-400", desc: "EPS & Revenue CAGR" },
                    { id: "L5", label: "Ownership", icon: CheckCircle2, col: "text-rose-400", desc: "Insider + FII Holding" },
                    { id: "L6", label: "Valuation", icon: Scale, col: "text-violet-400", desc: "No Bubble — P/E & PEG" },
                ].map(layer => (
                    <Card key={layer.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-help group">
                        <CardContent className="p-4 flex flex-col items-center text-center">
                            <layer.icon className={cn("h-6 w-6 mb-2", layer.col)} />
                            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">{layer.id}</span>
                            <h4 className="text-xs font-bold text-white mb-1">{layer.label}</h4>
                            <p className="text-[9px] text-slate-400 leading-tight opacity-0 group-hover:opacity-100 transition-opacity">{layer.desc}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-white/10 overflow-hidden text-slate-200">
                <CardHeader className="p-8 pb-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                                <ShieldCheck className="h-6 w-6 text-emerald-400" />
                                BSE/NSE 5-Layer Scanner
                            </CardTitle>
                            <p className="text-slate-400 mt-2 max-w-xl text-sm leading-relaxed">
                                Automated fundamental screening across 2,000+ NSE stocks.
                                <span className="block mt-1 text-[11px] text-slate-500 italic">Scores below 60 are automatically discarded.</span>
                            </p>
                        </div>
                        <Button
                            size="lg"
                            onClick={runFullScan}
                            disabled={isScanning || !!cooldown}
                            className={cn(
                                "font-bold h-12 px-8 transition-all shrink-0",
                                (isScanning || cooldown) ? "bg-white/5 text-slate-400" : "bg-emerald-500 hover:bg-emerald-600 text-black border-0"
                            )}
                        >
                            {isScanning ? <RefreshCw className="h-5 w-5 mr-2 animate-spin" /> : <Activity className="h-5 w-5 mr-2" />}
                            {isScanning ? "Scan in Progress..." : cooldown ? `Cooldown — ${cooldown.minutes}m remaining` : "Run Full Scan"}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                    {isScanning && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-emerald-400 font-medium flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    {scanStatus}
                                </span>
                                <span className="text-slate-400">{scanProgress > 0 ? `${scanProgress}%` : "Calculating..."}</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 transition-all duration-300"
                                    style={{ width: `${scanProgress}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest text-center mt-4">
                                Note: This scan is running on the cluster. You can refresh and the progress will resume.
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

            {!isScanning && lastScanResult?.newCount !== undefined && (
                <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/10 flex items-center justify-between text-slate-200">
                    <div className="flex items-center gap-3">
                        <Activity className="h-4 w-4 text-amber-500" />
                        <span className="text-xs text-amber-200/80">
                            Historical deltas:
                            <span className="font-bold text-emerald-400 mx-1">{lastScanResult.newCount} NEW</span> entries and
                            <span className="font-bold text-red-400 mx-1">{lastScanResult.droppedCount} EXITS</span> since last scan.
                        </span>
                    </div>
                    <Button
                        variant="link"
                        size="sm"
                        className="text-amber-500 text-xs h-auto p-0"
                        onClick={() => setView("results")}
                    >
                        View Results →
                    </Button>
                </div>
            )}
            </div>
            )}
        </div>
    );
}
