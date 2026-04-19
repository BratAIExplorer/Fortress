"use client";

import { useState } from "react";
import type { V5Stock, TopPick, MutualFund, IndexFund, Glossary } from "@/lib/types";
import { V5StockCard } from "@/components/fortress/V5StockCard";
import { V5TopPicks } from "@/components/fortress/V5TopPicks";
import { V5Glossary } from "@/components/fortress/V5Glossary";
import { V5MarketScanner } from "@/components/fortress/V5MarketScanner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingDown, Coins, Zap, Star, Info, Search } from "lucide-react";
import { cn } from "@/lib/utils";

function SplitStockGrid({ stocks }: { stocks: V5Stock[] }) {
    const curated = stocks.filter(s => !s.isLivePick);
    const live = stocks.filter(s => s.isLivePick);

    return (
        <div className="space-y-10">
            {curated.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Curated</span>
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-[10px] text-muted-foreground">{curated.length} picks</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {curated.map((stock) => (
                            <V5StockCard key={stock.symbol} stock={stock} />
                        ))}
                    </div>
                </div>
            )}
            {live.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Scanner Detected</span>
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-[10px] text-muted-foreground">{live.length} new picks</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Auto-detected by the live scanner. No editorial review yet.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {live.map((stock) => (
                            <V5StockCard key={stock.symbol} stock={stock} />
                        ))}
                    </div>
                </div>
            )}
            {curated.length === 0 && live.length === 0 && (
                <p className="text-sm text-muted-foreground">No stocks found. Run a scan to populate this list.</p>
            )}
        </div>
    );
}

interface V5ExtensionTabsProps {
    lowStocks: V5Stock[];
    pennyStocks: V5Stock[];
    subTenStocks: V5Stock[];
    topMF: MutualFund[];
    topIndex: IndexFund[];
    topPicks: TopPick[];
    glossary: Glossary;
}

export function V5ExtensionTabs({
    lowStocks,
    pennyStocks,
    subTenStocks,
    topMF,
    topIndex,
    topPicks,
    glossary
}: V5ExtensionTabsProps) {
    const [activeTab, setActiveTab] = useState("lows");
    const [market, setMarket] = useState<"NSE" | "US">("NSE");

    const isUS = market === "US";

    const tabs = [
        { id: "lows",        label: "52W Lows",           icon: TrendingDown, color: "data-[state=active]:bg-primary" },
        { id: "penny",       label: "Qualified Penny",     icon: Coins,        color: "data-[state=active]:bg-primary" },
        { id: "speculative", label: isUS ? "Sub-$2 Spec" : "Sub-₹20 Spec", icon: Zap, color: "data-[state=active]:bg-primary" },
        { id: "picks",       label: isUS ? "Top Picks & ETFs" : "Top Picks & MF", icon: Star, color: "data-[state=active]:bg-amber-500 data-[state=active]:text-black" },
        { id: "scanner",     label: "Intelligent Scanner", icon: Search,       color: "data-[state=active]:bg-emerald-600" },
        { id: "glossary",    label: "Glossary",            icon: Info,         color: "data-[state=active]:bg-cyan-600" },
    ];

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-white/10 pb-6">
                <TabsList className="bg-white/5 border border-white/10 h-12 p-1 flex-wrap h-auto">
                    {tabs.map((tab) => (
                        <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className={cn(
                                "h-10 px-6 transition-all font-medium",
                                activeTab === tab.id ? "shadow-lg scale-[1.02]" : "hover:bg-white/5",
                                tab.color
                            )}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <tab.icon className="h-4 w-4 mr-2" />
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* Market Selector */}
            <div className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 p-1 gap-1">
                {([
                    { code: "NSE", flag: "🇮🇳", label: "India" },
                    { code: "US",  flag: "🇺🇸", label: "US" },
                ] as const).map(m => (
                    <button
                        key={m.code}
                        onClick={() => setMarket(m.code)}
                        className={cn(
                            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                            market === m.code
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:text-white hover:bg-white/5"
                        )}
                    >
                        <span>{m.flag}</span>
                        <span>{m.label}</span>
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                        Curated
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-400" />
                        Live Scanner
                    </div>
                    <div className="border-l border-white/10 pl-4">
                        Reviewed: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                </div>
            </div>

            <TabsContent value="lows" className="mt-0 outline-none">
                <SplitStockGrid stocks={lowStocks} />
            </TabsContent>

            <TabsContent value="penny" className="mt-0 outline-none">
                <SplitStockGrid stocks={pennyStocks} />
            </TabsContent>

            <TabsContent value="speculative" className="mt-0 outline-none">
                <SplitStockGrid stocks={subTenStocks} />
                <div className="mt-12 p-6 rounded-xl border border-destructive/20 bg-destructive/5 max-w-3xl">
                    <h4 className="text-destructive font-bold flex items-center gap-2 mb-2 uppercase text-xs tracking-widest">
                        Extreme High Risk Disclaimer
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {isUS
                            ? "Sub-$2 stocks are included for educational transparency. These companies carry significant structural risk. Multi-bagger potential exists in recovery scenarios, but probability of full principal loss is high. Not recommended for core portfolios."
                            : "Sub-₹20 stocks are included for educational transparency. These companies have significant structural issues or extreme debt. While multi-bagger potential exists in recovery, the probability of 100% principal loss is high. Not recommended for core portfolios."}
                    </p>
                </div>
            </TabsContent>

            <TabsContent value="picks" className="mt-0 outline-none">
                <V5TopPicks picks={topPicks} mutualFunds={topMF} indexFunds={topIndex} />
            </TabsContent>

            <TabsContent value="scanner" className="mt-0 outline-none">
                <V5MarketScanner />
            </TabsContent>

            <TabsContent value="glossary" className="mt-0 outline-none">
                <V5Glossary data={glossary} />
            </TabsContent>
        </Tabs>
    );
}
