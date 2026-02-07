
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import { useRisk } from "./RiskContext";

interface Stock {
    id: string;
    symbol: string;
    name: string;
    sector: string;
    megatrend: string[];
    quality_score: number;
}

export function StockCard({ stock }: { stock: Stock }) {
    const { mode } = useRisk();

    // Simple logic to dim stocks based on mode (mock logic)
    // In reality, each stock would have a "beta" or "suitability" score
    const isDimmed = mode === "Conservative" && stock.quality_score < 80;

    return (
        <Link href={`/stocks/${stock.symbol.toLowerCase()}`}>
            <motion.div
                whileHover={{ y: -5 }}
                className={`group relative h-full transition-opacity duration-300 ${isDimmed ? "opacity-40 grayscale" : "opacity-100"}`}
            >
                <Card className="h-full overflow-hidden border-border/50 bg-card/50 backdrop-blur transition-colors hover:border-primary/50 hover:bg-card">
                    <CardHeader className="p-4 pb-2">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-serif text-lg font-bold tracking-tight">{stock.symbol}</h3>
                                <p className="text-xs text-muted-foreground truncate max-w-[120px]">{stock.name}</p>
                            </div>
                            <Badge variant="outline" className="text-[10px] font-mono">
                                {stock.quality_score}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                        <div className="flex flex-wrap gap-1 mb-3">
                            {stock.megatrend.slice(0, 2).map((m) => (
                                <span key={m} className="inline-flex items-center rounded-sm bg-secondary/10 px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                                    {m}
                                </span>
                            ))}
                        </div>

                        {/* Hover Reveal: The "One Liner" */}
                        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-primary/10 p-3 backdrop-blur transition-transform duration-300 group-hover:translate-y-0">
                            <p className="text-xs font-medium text-primary flex items-center gap-1">
                                View Thesis <ArrowUpRight className="h-3 w-3" />
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </Link>
    );
}
