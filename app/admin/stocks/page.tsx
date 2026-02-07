
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter } from "lucide-react";
import { mockStocks } from "@/lib/mock-data";

export default function AdminStocksPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-serif tracking-tight">Stock Management</h1>
                    <p className="text-muted-foreground">Manage the Fortress 30 and other lists.</p>
                </div>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" /> Add Stock
                </Button>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-lg font-medium">All Stocks</CardTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                            <Filter className="h-4 w-4" /> Filter
                        </Button>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search ticker..."
                                className="h-9 w-64 rounded-md border border-input bg-transparent pl-9 pr-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 align-middle font-medium">Symbol</th>
                                    <th className="h-12 px-4 align-middle font-medium">Name</th>
                                    <th className="h-12 px-4 align-middle font-medium">Sector</th>
                                    <th className="h-12 px-4 align-middle font-medium">Megatrend</th>
                                    <th className="h-12 px-4 align-middle font-medium">Score</th>
                                    <th className="h-12 px-4 align-middle font-medium">Status</th>
                                    <th className="h-12 px-4 align-middle font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockStocks.map((stock) => (
                                    <tr key={stock.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <td className="p-4 align-middle font-medium">{stock.symbol}</td>
                                        <td className="p-4 align-middle">{stock.name}</td>
                                        <td className="p-4 align-middle text-muted-foreground">{stock.sector}</td>
                                        <td className="p-4 align-middle">
                                            <div className="flex gap-1 flex-wrap">
                                                {stock.megatrend.map(m => (
                                                    <Badge key={m} variant="secondary" className="text-[10px]">{m}</Badge>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle font-bold text-primary">{stock.quality_score}</td>
                                        <td className="p-4 align-middle">
                                            <Badge variant={stock.status === 'Active' ? 'default' : 'outline'}>
                                                {stock.status}
                                            </Badge>
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <Button variant="ghost" size="sm">Edit</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
