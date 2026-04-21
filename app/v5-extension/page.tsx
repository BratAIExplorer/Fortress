import { getV5LowStocks, getV5PennyStocks, getV5SubTenStocks, getLiveSub20Stocks, getLive52WLowStocks, getLivePennyStocks, getV5TopMutualFunds, getV5TopIndexFunds, getV5TopFortressPicks, getGlossaryData } from "@/app/actions";
import { V5ExtensionTabs } from "@/components/fortress/V5ExtensionTabs";
import { Navbar } from "@/components/fortress/Navbar";

export const dynamic = "force-dynamic";

export default async function V5ExtensionPage({
    searchParams,
}: {
    searchParams: Promise<{ market?: string }>;
}) {
    const params = await searchParams;
    const market = (params.market ?? "NSE").toUpperCase();

    const [
        curatedLowStocks, liveLowStocks,
        curatedPennyStocks, livePennyStocks,
        curatedSubTenStocks, liveSub20Stocks,
        topMF,
    ] = await Promise.all([
        getV5LowStocks(market), getLive52WLowStocks(market),
        getV5PennyStocks(market), getLivePennyStocks(market),
        getV5SubTenStocks(market), getLiveSub20Stocks(market),
        getV5TopMutualFunds(market),
    ]);

    const mergeWithLive = (curated: any[], live: any[]) => {
        const curatedSymbols = new Set(curated.map((s: any) => s.symbol));
        return [...curated, ...live.filter((s: any) => !curatedSymbols.has(s.symbol))];
    };

    const lowStocks = mergeWithLive(curatedLowStocks, liveLowStocks);
    const pennyStocks = mergeWithLive(curatedPennyStocks, livePennyStocks);
    const subTenStocks = mergeWithLive(curatedSubTenStocks, liveSub20Stocks);
    const topIndex = await getV5TopIndexFunds(market);
    const topPicks = await getV5TopFortressPicks(market);
    const glossary = await getGlossaryData();

    return (
        <div className="min-h-screen bg-[#050505] text-slate-200 pb-20 selection:bg-primary/30">
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
                    market={market}
                />
            </main>
        </div>
    );
}
