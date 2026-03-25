import { getV5LowStocks, getV5PennyStocks, getV5SubTenStocks, getLiveSub20Stocks, getLive52WLowStocks, getLivePennyStocks, getV5TopMutualFunds, getV5TopIndexFunds, getV5TopFortressPicks, getGlossaryData } from "@/app/actions";
import { V5ExtensionTabs } from "@/components/fortress/V5ExtensionTabs";
import { Navbar } from "@/components/fortress/Navbar";

export const dynamic = "force-dynamic";

export default async function V5ExtensionPage() {
    const [
        curatedLowStocks, liveLowStocks,
        curatedPennyStocks, livePennyStocks,
        curatedSubTenStocks, liveSub20Stocks,
        topMF,
    ] = await Promise.all([
        getV5LowStocks(), getLive52WLowStocks(),
        getV5PennyStocks(), getLivePennyStocks(),
        getV5SubTenStocks(), getLiveSub20Stocks(),
        getV5TopMutualFunds(),
    ]);

    const mergeWithLive = (curated: typeof curatedLowStocks, live: typeof liveLowStocks) => {
        const curatedSymbols = new Set(curated.map(s => s.symbol));
        return [...curated, ...live.filter(s => !curatedSymbols.has(s.symbol))];
    };

    const lowStocks = mergeWithLive(curatedLowStocks, liveLowStocks);
    const pennyStocks = mergeWithLive(curatedPennyStocks, livePennyStocks);
    const subTenStocks = mergeWithLive(curatedSubTenStocks, liveSub20Stocks);
    const topIndex = await getV5TopIndexFunds();
    const topPicks = await getV5TopFortressPicks();
    const glossary = await getGlossaryData();

    return (
        <div className="min-h-screen bg-[#050505] text-slate-200 pb-20 selection:bg-primary/30">
            {/* Navbar */}
            <Navbar
                subtitle="Institutional Expansion v5"
                className="border-white/5 bg-black/60 backdrop-blur-xl"
            />

            <main className="container px-4 sm:px-8 pt-12 max-w-7xl">
                <div className="mb-12 space-y-4">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tighter text-white">
                        Specialized <span className="text-primary italic">Deep Value</span> Scans
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
                        Beyond the flagship Fortress 30. These specialized filters target unique market conditions: extreme oversold quality, micro-cap gems, and high-probability turnarounds.
                    </p>
                </div>

                <V5ExtensionTabs
                    lowStocks={lowStocks}
                    pennyStocks={pennyStocks}
                    subTenStocks={subTenStocks}
                    topMF={topMF}
                    topIndex={topIndex}
                    topPicks={topPicks}
                    glossary={glossary}
                />
            </main>
        </div>
    );
}
