"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ShieldCheck, Activity, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ScanResult {
    type: "complete";
    scanId: string;
    newCount: number;
    droppedCount: number;
    deltas: Record<string, unknown>;
}

export function V5MarketScanner() {
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanStatus, setScanStatus] = useState("");
    const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null);

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
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error occurred";
            toast.error(`Scan failed: ${message}`);
            setIsScanning(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-white/10 overflow-hidden text-slate-200">
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
                    <Button variant="link" size="sm" className="text-amber-500 text-xs h-auto p-0">View Changes</Button>
                </div>
            )}
        </div>
    );
}
