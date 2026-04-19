import { RiskProvider } from "@/components/fortress/RiskContext";
import { RiskToggle } from "@/components/fortress/RiskToggle";
import { ScannerCandidateCard } from "@/components/fortress/ScannerCandidateCard";
import { getLiveF30Stocks, getLiveF30Candidates } from "@/app/actions";
import { WisdomWidget } from "@/components/learning/WisdomWidget";
import { ScannerCandidate } from "@/lib/types";
import { getMarket } from "@/lib/markets/config";
import { RadioTower, Zap } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function Fortress30Page({
    searchParams,
}: {
    searchParams: Promise<{ market?: string }>;
}) {
    const params = await searchParams;
    const marketCode = (params.market ?? "US").toUpperCase();
    const marketConfig = getMarket(marketCode);

    const [stocks, candidates] = await Promise.all([
        getLiveF30Stocks(30, marketCode),
        getLiveF30Candidates(10, marketCode),
    ]);

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
                                Top 30 stocks from the latest {marketConfig.flag} {marketConfig.label} scan,
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
                    {stocks.length === 0 ? (
                        <div className="py-24 text-center border border-dashed border-white/10 rounded-xl">
                            <RadioTower className="h-10 w-10 text-slate-600 mx-auto mb-4" />
                            <h4 className="text-slate-300 font-medium">
                                No {marketConfig.flag} {marketConfig.label} scan data yet
                            </h4>
                            <p className="text-slate-500 text-xs mt-2 max-w-sm mx-auto">
                                The daily scanner will populate this list automatically.
                                Check back after market close.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {stocks.map((stock: ScannerCandidate) => (
                                <ScannerCandidateCard key={stock.id} candidate={stock} />
                            ))}
                        </div>
                    )}

                    {/* Candidates (31-40) */}
                    {candidates.length > 0 && (
                        <div className="mt-20 space-y-6">
                            <div className="flex items-center gap-4">
                                <RadioTower className="h-4 w-4 text-amber-400" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                                    Ranked 31–40
                                </span>
                                <div className="flex-1 h-px bg-white/10" />
                                <span className="text-[10px] text-muted-foreground">
                                    {candidates.length} stocks · just outside top 30
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground max-w-2xl">
                                Next highest-scoring stocks below the Fortress 30 cutoff.
                                Watch these for potential promotion next scan.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {candidates.map((c: ScannerCandidate) => (
                                    <ScannerCandidateCard key={c.id} candidate={c} />
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </RiskProvider>
    );
}

