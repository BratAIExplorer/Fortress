
import { RiskProvider } from "@/components/fortress/RiskContext";
import { RiskToggle } from "@/components/fortress/RiskToggle";
import { StockCard } from "@/components/fortress/StockCard";
import { ScannerCandidateCard } from "@/components/fortress/ScannerCandidateCard";
import { getStocks, getLiveF30Candidates } from "@/app/actions";
import { WisdomWidget } from "@/components/learning/WisdomWidget";
import { Stock, ScannerCandidate } from "@/lib/types";
import { Navbar } from "@/components/fortress/Navbar";
import { RadioTower } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function Fortress30Page() {
    const [stocks, candidates] = await Promise.all([
        getStocks(),
        getLiveF30Candidates(10),
    ]);

    return (
        <RiskProvider>
            <div className="min-h-screen bg-background pb-20">
                {/* Navbar */}
                <Navbar
                    title="Fortress 30"
                    rightElement={<RiskToggle />}
                />

                <main className="container px-4 sm:px-8 pt-12">
                    <div className="mb-12 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                        <div className="lg:col-span-2 text-left">
                            <h1 className="text-4xl font-serif font-bold tracking-tight mb-4">The Conviction List</h1>
                            <p className="text-muted-foreground max-w-2xl">
                                30 high-conviction businesses filtered through our 5-Layer Protection Framework.
                                Select your risk appetite above to see how to weight them.
                            </p>
                        </div>
                        <div>
                            <WisdomWidget />
                        </div>
                    </div>

                    {/* Curated Fortress 30 */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {stocks.map((stock: Stock) => (
                            <StockCardWrapper key={stock.id} stock={stock} />
                        ))}

                        {/* Fillers if less than 15 stocks */}
                        {stocks.length < 15 && Array.from({ length: 15 - stocks.length }).map((_, i) => (
                            <PlaceholderCard key={`placeholder-${i}`} />
                        ))}
                    </div>

                    {/* Scanner Candidates */}
                    {candidates.length > 0 && (
                        <div className="mt-20 space-y-6">
                            <div className="flex items-center gap-4">
                                <RadioTower className="h-4 w-4 text-emerald-400" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                                    Scanner Candidates
                                </span>
                                <div className="flex-1 h-px bg-white/10" />
                                <span className="text-[10px] text-muted-foreground">{candidates.length} picks · not yet reviewed</span>
                            </div>
                            <p className="text-xs text-muted-foreground max-w-2xl">
                                Top-scoring stocks from the latest scan not currently in the Fortress 30. Ranked by Multi-Bagger Score. No editorial review — use as a research starting point only.
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

function StockCardWrapper({ stock }: { stock: Stock }) {
    return (
        <div className="h-full">
            <StockCard stock={stock} />
        </div>
    )
}

function PlaceholderCard() {
    return (
        <div className="opacity-30 pointer-events-none grayscale h-40 rounded-xl border border-dashed border-muted-foreground/30 flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Open Slot</span>
        </div>
    )
}
