import { RiskProvider } from "@/components/fortress/RiskContext";
import { RiskToggle } from "@/components/fortress/RiskToggle";
import { Fortress30Grid } from "@/components/fortress/Fortress30Grid";
import { getLiveF30Stocks, getLiveF30Candidates } from "@/app/actions";
import { WisdomWidget } from "@/components/learning/WisdomWidget";
import { getMarket } from "@/lib/markets/config";
import { Zap } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function Fortress30Page({
    searchParams,
}: {
    searchParams: Promise<{ market?: string }>;
}) {
    const params = await searchParams;
    const marketCode = (params.market ?? "NSE").toUpperCase();
    const marketConfig = getMarket(marketCode);

    let stocks: Awaited<ReturnType<typeof getLiveF30Stocks>> = [];
    let candidates: Awaited<ReturnType<typeof getLiveF30Candidates>> = [];
    let dbError = false;
    try {
        [stocks, candidates] = await Promise.all([
            getLiveF30Stocks(30, marketCode),
            getLiveF30Candidates(10, marketCode),
        ]);
    } catch {
        dbError = true;
    }

    return (
        <RiskProvider>
            <div className="min-h-screen bg-background pb-20">
                <main className="container px-4 sm:px-8 pt-12">
                    {/* Header */}
                    <div className="mb-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-emerald-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                                        Live Scanner · Top by MB Score
                                    </span>
                                </div>
                                <RiskToggle />
                            </div>
                            <h1 className="text-4xl font-serif font-bold tracking-tight">The Conviction List</h1>
                            <p className="text-muted-foreground max-w-2xl">
                                Top 30 stocks from the latest {marketConfig.label} scan,
                                ranked by Multi-Bagger Score. Automatically updated every scan cycle.
                                Click any stock to see exactly why it was selected.
                            </p>
                        </div>
                        <div>
                            <WisdomWidget />
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="mb-8 bg-amber-950/20 border-l-4 border-amber-500/50 p-6 rounded-2xl backdrop-blur-sm">
                        <p className="text-sm text-amber-200/80 leading-relaxed font-medium">
                            <strong className="text-amber-400">Important Disclaimer:</strong> This ranking is for educational and research purposes only.
                            It is not financial advice. Past performance does not guarantee future results.
                            Please consult a licensed financial advisor before making investment decisions.
                        </p>
                    </div>

                    {/* Stock Grid */}
                    <Fortress30Grid stocks={stocks} marketConfig={marketConfig} candidates={candidates} dbError={dbError} />
                </main>
            </div>
        </RiskProvider>
    );
}

