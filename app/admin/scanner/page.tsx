"use client";

import { useState } from "react";
import { Navbar } from "@/components/fortress/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, BarChart3, Activity, TrendingUp, CheckCircle2, RefreshCw, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const WEIGHT_PRESETS = {
    balanced: { l1: 25, l2: 20, l3: 15, l4: 25, l5: 15 },
    conservative: { l1: 40, l2: 20, l3: 10, l4: 15, l5: 15 },
    aggressive: { l1: 15, l2: 15, l3: 20, l4: 40, l5: 10 },
    growth_nri: { l1: 20, l2: 15, l3: 25, l4: 35, l5: 5 },
};

const MARKETS = [
    { id: "NSE", label: "NSE (India)", count: "~2,000", icon: "🇮🇳" },
    { id: "US", label: "NYSE/NASDAQ", count: "~5,000", icon: "🇺🇸" },
    { id: "HKEX", label: "HKEX (Hong Kong)", count: "~2,400", icon: "🇭🇰" },
];

export default function AdminScannerPage() {
    const [market, setMarket] = useState<string>("NSE");
    const [weights, setWeights] = useState(WEIGHT_PRESETS.balanced);
    const [isScanning, setIsScanning] = useState(false);

    const total = weights.l1 + weights.l2 + weights.l3 + weights.l4 + weights.l5;
    const isValid = total === 100;

    const handleWeightChange = (layer: keyof typeof weights, value: number) => {
        setWeights(prev => ({ ...prev, [layer]: value }));
    };

    const runScan = async () => {
        if (!isValid) return;
        setIsScanning(true);
        toast.info(`Starting ${market} scan with custom weights...`);

        try {
            const res = await fetch("/api/scan/run", {
                method: "POST",
                body: JSON.stringify({ market, weights }),
            });

            if (res.status === 409) {
                toast.warning(`A ${market} scan is already running.`);
                return;
            }

            if (!res.ok) throw new Error("Failed to trigger scan");

            toast.success("Scan initiated! Check public dashboard for real-time progress.");
        } catch {
            toast.error("Error triggering scan engine.");
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-slate-200">
            <Navbar subtitle="Institutional Command Center" />

            <main className="container px-8 pt-12 max-w-5xl mx-auto space-y-12">
                <header className="space-y-2">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Market Intelligence Terminal</h1>
                    <p className="text-slate-400">Configure global scanning parameters and layer weighting.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left: Market Selection */}
                    <div className="lg:col-span-1 space-y-6">
                        <section className="space-y-3">
                            <h3 className="text-sm font-mono uppercase text-muted-foreground tracking-widest">1. Select Target Market</h3>
                            <div className="space-y-2">
                                {MARKETS.map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => setMarket(m.id)}
                                        className={cn(
                                            "w-full p-4 rounded-xl border flex items-center justify-between transition-all",
                                            market === m.id
                                                ? "bg-primary/10 border-primary text-white"
                                                : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{m.icon}</span>
                                            <div className="text-left">
                                                <div className="font-bold">{m.label}</div>
                                                <div className="text-[10px] opacity-60 uppercase">{m.id} Market</div>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] font-mono">{m.count}</Badge>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-sm font-mono uppercase text-muted-foreground tracking-widest">Presets</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(WEIGHT_PRESETS).map(([name, val]) => (
                                    <Button
                                        key={name}
                                        variant="outline"
                                        size="sm"
                                        className="capitalize text-[10px] font-mono"
                                        onClick={() => setWeights(val)}
                                    >
                                        {name.replace("_", " ")}
                                    </Button>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right: Layer Weighting */}
                    <div className="lg:col-span-2 space-y-8 bg-white/5 border border-white/10 rounded-2xl p-8">
                        <header className="flex justify-between items-center">
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-white uppercase tracking-tight">2. Institutional Layer Weighting</h3>
                                <p className="text-xs text-slate-500">Each layer contributes to the 100-pt Fortress Score.</p>
                            </div>
                            <div className={cn(
                                "p-3 rounded-xl border font-mono text-xl font-bold flex flex-col items-center min-w-[80px]",
                                isValid ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" : "border-rose-500/50 text-rose-400 bg-rose-500/10"
                            )}>
                                <span className="text-[10px] uppercase opacity-60">Total</span>
                                {total}
                            </div>
                        </header>

                        <div className="space-y-8">
                            {[
                                { id: "l1", label: "Protection", icon: Shield, color: "text-emerald-400", desc: "D/E, OCF+, and ROCE Stability" },
                                { id: "l2", label: "Pricing Power", icon: BarChart3, color: "text-blue-400", desc: "Gross & Operating Margin consistency" },
                                { id: "l3", label: "Relative Strength", icon: Activity, color: "text-amber-400", desc: "3M Return vs Nifty 50 Benchmark" },
                                { id: "l4", label: "Growth Visibility", icon: TrendingUp, color: "text-purple-400", desc: "Revenue & Earnings CAGR trajectory" },
                                { id: "l5", label: "Governance", icon: CheckCircle2, color: "text-rose-400", desc: "Promoter Pledging & Audit Quality" },
                            ].map(l => (
                                <div key={l.id} className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-3">
                                            <l.icon className={cn("h-5 w-5", l.color)} />
                                            <div>
                                                <h4 className="text-sm font-bold text-white">{l.label}</h4>
                                                <p className="text-[11px] text-slate-500">{l.desc}</p>
                                            </div>
                                        </div>
                                        <span className="font-mono text-sm font-bold">{weights[l.id as keyof typeof weights]} pts</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="50"
                                        value={weights[l.id as keyof typeof weights]}
                                        onChange={(e) => handleWeightChange(l.id as keyof typeof weights, parseInt(e.target.value))}
                                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                </div>
                            ))}
                        </div>

                        {!isValid && (
                            <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-3">
                                <AlertTriangle className="h-4 w-4" />
                                Weights must sum to exactly 100 points for institutional validity.
                            </div>
                        )}

                        <Button
                            size="lg"
                            disabled={!isValid || isScanning}
                            onClick={runScan}
                            className="w-full py-8 text-lg font-bold bg-primary hover:bg-primary/90 text-black border-0 transition-all rounded-xl mt-6"
                        >
                            {isScanning ? (
                                <RefreshCw className="h-6 w-6 animate-spin mr-3" />
                            ) : (
                                <Activity className="h-6 w-6 mr-3" />
                            )}
                            {isScanning ? "Engaging Engine..." : `Run Automated ${market} Scan`}
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
