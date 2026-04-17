import { RiskProvider } from "@/components/fortress/RiskContext";
import { RiskToggle } from "@/components/fortress/RiskToggle";
import { ScannerCandidateCard } from "@/components/fortress/ScannerCandidateCard";
import { getLiveF30Stocks, getLiveF30Candidates } from "@/app/actions";
import { WisdomWidget } from "@/components/learning/WisdomWidget";
import { ScannerCandidate } from "@/lib/types";
import { Navbar } from "@/components/fortress/Navbar";
import { RadioTower, Zap } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function Fortress30Page() {
    const [stocks, candidates] = await Promise.all([
        getLiveF30Stocks(30),
        getLiveF30Candidates(10),
    ]);

    return (
        <RiskProvider>
            <div className="min-h-screen bg-background pb-20">
                <Navbar
                    title="Fortress 30"
                    rightElement={<RiskToggle />}
                />

                <main className="container px-4 sm:px-8 pt-12">
                    <div className="mb-12 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                        <div className="lg:col-span-2 text-left">
                            <div className="flex items-center gap-2 mb-3">
                                <Zap className="h-4 w-4 text-emerald-400" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                                    Live Scanner · Top by MB Score
                                </span>
                            </div>
                            <h1 className="text-4xl font-serif font-bold tracking-tight mb-4">The Conviction List</h1>
                            <p className="text-muted-foreground max-w-2xl">
                                Top 30 stocks from the latest scan, ranked by Multi-Bagger Score.
                                Automatically updated every scan cycle — no manual curation.
                            </p>
                        </div>
                        <div>
                            <WisdomWidget />
                        </div>
                    </div>

                    {/* Live Fortress 30 */}
                    {stocks.length === 0 ? (
                        <div className="py-24 text-center border border-dashed border-white/10 rounded-xl">
                            <RadioTower className="h-10 w-10 text-slate-600 mx-auto mb-4" />
                            <h4 className="text-slate-300 font-medium">No scan data yet</h4>
                            <p className="text-slate-500 text-xs mt-2 max-w-sm mx-auto">
                                Run a scan from the Intelligent Scanner tab to populate the Fortress 30.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {stocks.map((stock: ScannerCandidate) => (
                                <ScannerCandidateCard key={stock.id} candidate={stock} />
                            ))}
                        </div>
                    )}

                    {/* Next 10 candidates */}
                    {candidates.length > 0 && (
                        <div className="mt-20 space-y-6">
                            <div className="flex items-center gap-4">
                                <RadioTower className="h-4 w-4 text-amber-400" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                                    Ranked 31–40
                                </span>
                                <div className="flex-1 h-px bg-white/10" />
                                <span className="text-[10px] text-muted-foreground">{candidates.length} stocks · just outside top 30</span>
                            </div>
                            <p className="text-xs text-muted-foreground max-w-2xl">
                                Next highest-scoring stocks below the Fortress 30 cutoff. Watch these for potential promotion next scan.
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
