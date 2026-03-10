
import { getV5LowStocks, getV5PennyStocks, getV5SubTenStocks } from "@/app/actions";
import type { V5Stock } from "@/lib/types";
import { V5StockCard } from "@/components/fortress/V5StockCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, TrendingDown, Coins, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function V5ExtensionPage() {
    const lowStocks = await getV5LowStocks();
    const pennyStocks = await getV5PennyStocks();
    const subTenStocks = await getV5SubTenStocks();

    return (
        <div className="min-h-screen bg-[#050505] text-slate-200 pb-20 selection:bg-primary/30">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
                <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-1.5 rounded-lg border border-primary/20">
                            <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <span className="text-xl font-serif font-bold tracking-tight block leading-none">Fortress Intelligence</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-1 block">Institutional Expansion v5</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container px-4 sm:px-8 pt-12 max-w-7xl">
                <div className="mb-12 space-y-4">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tighter text-white">
                        Specialized <span className="text-primary italic">Deep Value</span> Scans
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
                        Beyond the flagship Fortress 30. These specialized filters target unique market conditions: extreme oversold quality, micro-cap gems, and high-probability turnarounds.
                    </p>
                </div>

                <Tabs defaultValue="lows" className="space-y-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-white/10 pb-6">
                        <TabsList className="bg-white/5 border border-white/10 h-12 p-1">
                            <TabsTrigger value="lows" className="data-[state=active]:bg-primary h-full px-6 transition-all">
                                <TrendingDown className="h-4 w-4 mr-2" />
                                52W Lows
                            </TabsTrigger>
                            <TabsTrigger value="penny" className="data-[state=active]:bg-primary h-full px-6 transition-all">
                                <Coins className="h-4 w-4 mr-2" />
                                Qualified Penny
                            </TabsTrigger>
                            <TabsTrigger value="speculative" className="data-[state=active]:bg-primary h-full px-6 transition-all">
                                <Zap className="h-4 w-4 mr-2" />
                                Sub-₹10 Spec
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-amber-500" />
                                Curated Scan
                            </div>
                            <div className="border-l border-white/10 pl-4">
                                Reviewed: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                        </div>
                    </div>

                    <TabsContent value="lows" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {lowStocks.map((stock: V5Stock) => (
                                <V5StockCard key={stock.symbol} stock={stock} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="penny" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {pennyStocks.map((stock: V5Stock) => (
                                <V5StockCard key={stock.symbol} stock={stock} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="speculative" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {subTenStocks.map((stock: V5Stock) => (
                                <V5StockCard key={stock.symbol} stock={stock} />
                            ))}
                        </div>
                        <div className="mt-12 p-6 rounded-xl border border-destructive/20 bg-destructive/5 max-w-3xl">
                            <h4 className="text-destructive font-bold flex items-center gap-2 mb-2 uppercase text-xs tracking-widest">
                                High Risk Disclaimer
                            </h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Sub-₹10 stocks are included for educational transparency. These companies have significant structural issues or extreme debt. While multi-bagger potential exists in recovery, the probability of 100% principal loss is high. Not recommended for core portfolios.
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
