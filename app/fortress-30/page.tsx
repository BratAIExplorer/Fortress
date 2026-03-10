
import { RiskProvider } from "@/components/fortress/RiskContext";
import { RiskToggle } from "@/components/fortress/RiskToggle";
import { StockCard } from "@/components/fortress/StockCard";
import { getStocks } from "@/app/actions";
import { WisdomWidget } from "@/components/learning/WisdomWidget";
import { Stock } from "@/lib/types";
import { Navbar } from "@/components/fortress/Navbar";

export const dynamic = 'force-dynamic';

export default async function Fortress30Page() {
    const stocks = await getStocks();

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

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {stocks.map((stock: Stock) => (
                            <StockCardWrapper key={stock.id} stock={stock} />
                        ))}

                        {/* Fillers if less than 15 stocks */}
                        {stocks.length < 15 && Array.from({ length: 15 - stocks.length }).map((_, i) => (
                            <PlaceholderCard key={`placeholder-${i}`} />
                        ))}
                    </div>
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
