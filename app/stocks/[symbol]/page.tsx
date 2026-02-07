
import { getStockBySymbol } from "@/app/actions";
import { WhyBox } from "@/components/stock/WhyBox";
import { Financials } from "@/components/stock/Financials";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConceptTooltip } from "@/components/learning/ConceptTooltip";

export default async function StockDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
    const { symbol } = await params;
    const stock = await getStockBySymbol(symbol);

    if (!stock) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="container px-4 sm:px-8 py-8">
                <Link href="/fortress-30">
                    <Button variant="ghost" size="sm" className="mb-6 -ml-2 gap-2 text-muted-foreground">
                        <ArrowLeft className="h-4 w-4" /> Back to Fortress 30
                    </Button>
                </Link>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl font-serif font-bold tracking-tight">{stock.symbol}</h1>
                            <Badge variant="outline" className="text-base py-1">{stock.sector}</Badge>
                        </div>
                        <p className="text-xl text-muted-foreground">{stock.name}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-mono font-bold">₹{stock.current_price || stock.price}</div>
                        <div className="text-sm text-green-500 font-medium">Live</div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Thesis (2/3 width) */}
                    <div className="lg:col-span-2 space-y-8">
                        <WhyBox stock={stock} />

                        <section>
                            <h3 className="text-lg font-bold font-serif mb-4">Investment Logic</h3>
                            <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed">
                                <p>
                                    {stock.thesis?.investment_logic || "Detailed investment logic is currently being curated by the research team."}
                                    <br /><br />
                                    We look for businesses with strong <ConceptTooltip term="Operating Leverage" definition="A measure of how revenue growth translates to operating income growth. High operating leverage means a small increase in sales leads to a large increase in profits." /> and a durable <ConceptTooltip term="Moat" definition="A durable competitive advantage that protects a business's profits from competitors." />.
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Financials (1/3 width) */}
                    <div className="space-y-8">
                        <Financials stock={stock} />

                        <div className="rounded-xl border bg-card p-6">
                            <h3 className="text-sm font-medium mb-4">Risk Rating</h3>
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full border-4 border-amber-500/20 flex items-center justify-center text-xl font-bold text-amber-500">
                                    {stock.quality_score}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Quality Score based on the <span className="font-semibold text-primary">5-Layer Framework</span>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
