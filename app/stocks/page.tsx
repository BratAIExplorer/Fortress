import { getStocks } from "@/app/actions";
import { Navbar } from "@/components/fortress/Navbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { TrendingUp, Shield, BarChart4 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StocksPage() {
    const stocks = await getStocks();

    return (
        <div className="min-h-screen bg-background">
            <Navbar title="Fortress Stocks" subtitle="Framework Analysis" />
            
            <main className="container px-4 sm:px-8 py-12">
                <header className="mb-12">
                    <h1 className="text-4xl font-serif font-bold mb-4 tracking-tight">Active Coverage</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        Comprehensive analysis of Indian and Global equities using the Fortress 5-Layer Framework. 
                        We don't track prices; we track quality and risk.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stocks.map((stock) => (
                        <Link key={stock.id} href={`/stocks/${stock.symbol}`}>
                            <Card className="group hover:border-primary/50 transition-all cursor-pointer bg-card/50 backdrop-blur-sm border-white/10">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-2xl font-bold font-serif group-hover:text-primary transition-colors">
                                        {stock.symbol}
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={stock.quality_score >= 80 ? "default" : "secondary"}>
                                            Score: {stock.quality_score}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm font-medium text-muted-foreground mb-4">{stock.name}</div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Sector</p>
                                            <p className="text-sm font-medium flex items-center gap-1.5 capitalize">
                                                <BarChart4 className="h-3 w-3 text-primary" />
                                                {stock.sector}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Market Cap</p>
                                            <p className="text-sm font-medium">₹{stock.market_cap_crores.toLocaleString()} Cr</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex gap-1.5">
                                            {stock.megatrend.slice(0, 2).map((tag, i) => (
                                                <Badge key={i} variant="outline" className="text-[10px] lowercase bg-primary/5">
                                                    #{tag}
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="text-xs text-primary font-medium group-hover:translate-x-1 transition-transform">
                                            View Framework →
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {stocks.length === 0 && (
                    <div className="text-center py-20 border rounded-2xl border-dashed border-white/10">
                        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <p className="text-muted-foreground">No stocks currently in coverage. Run a scan to populate.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
