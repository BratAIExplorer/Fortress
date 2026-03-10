export const dynamic = 'force-dynamic';

import { getV5StocksForAdmin } from "@/app/actions";
import V5StockEditor from "@/components/admin/V5StockEditor";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { V5Stock } from "@/lib/types";

export default async function AdminStocksPage() {
    const stocks = await getV5StocksForAdmin();

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-serif tracking-tight">V5 Stock Management</h1>
                    <CardDescription>Manage the institutional expansion stocks, pricing, and specialized analysis.</CardDescription>
                </div>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                    {stocks.length} V5 Stocks
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {stocks.map((stock: V5Stock) => (
                    <Card key={stock.id} className="border-border/50 hover:border-primary/30 transition-colors flex flex-col">
                        <CardHeader className="pb-3 text-left">
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="secondary" className="font-mono">{stock.symbol}</Badge>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{stock.v5Category?.replace('_', ' ')}</span>
                            </div>
                            <CardTitle className="text-base line-clamp-1">{stock.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-between">
                            <div className="space-y-3 mb-4">
                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">PRICE</span>
                                        <span className="font-bold">₹{stock.current_price}</span>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <span className="text-muted-foreground">QS</span>
                                        <span className="font-bold">{stock.quality_score}</span>
                                    </div>
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    <span className="font-bold">TAG:</span> {stock.tag}
                                </div>
                            </div>
                            <V5StockEditor stock={stock} />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
