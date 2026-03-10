
"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Shield, TrendingDown, Target, Zap, AlertTriangle } from "lucide-react";
import { Stock } from "@/lib/types";

export function V5StockCard({ stock }: { stock: Stock }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="group relative h-full"
        >
            <Card className="h-full overflow-hidden border-primary/20 bg-card/50 backdrop-blur transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-serif text-xl font-bold tracking-tight text-foreground">{stock.symbol}</h3>
                                {stock.risk === "EXTREME" && <Zap className="h-3 w-3 text-destructive animate-pulse" />}
                            </div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stock.name}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <Badge variant={stock.quality_score >= 80 ? "default" : "outline"} className="font-mono text-xs">
                                {stock.quality_score}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground font-mono">OCF: {stock.ocf || "N/A"}</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 space-y-4">
                    {/* Key Stats Row */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] bg-secondary/20 p-2 rounded-sm border border-border/50">
                        <div className="flex flex-col">
                            <span className="text-muted-foreground italic">&ldquo;Why it fell&rdquo;</span>
                            <span className="font-bold text-foreground">₹{stock.current_price}</span>
                        </div>
                        <div className="flex flex-col text-right">
                            <span className="text-muted-foreground uppercase text-[9px]">52W Drop</span>
                            <span className="font-bold text-destructive">{stock.drop52w}%</span>
                        </div>
                    </div>

                    {/* The "Why" Section */}
                    {stock.why_down && (
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-destructive uppercase tracking-tight">
                                <TrendingDown className="h-3 w-3" /> Why It Fell
                            </div>
                            <p className="text-[11px] leading-relaxed text-muted-foreground italic line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                                "{stock.why_down}"
                            </p>
                        </div>
                    )}

                    {stock.why_buy && (
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-tight">
                                <Target className="h-3 w-3" /> Fortress View
                            </div>
                            <p className="text-[11px] leading-relaxed text-foreground font-medium">
                                {stock.why_buy}
                            </p>
                        </div>
                    )}

                    {/* Speculative Fields */}
                    {stock.multi_bagger_case && (
                        <div className="space-y-1.5 border-t border-border/50 pt-2">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500 uppercase tracking-tight">
                                <Zap className="h-3 w-3" /> Multi-Bagger Case
                            </div>
                            <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                                {stock.multi_bagger_case}
                            </p>
                        </div>
                    )}

                    {/* Tag / Moat */}
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/30">
                        <span className="text-[9px] font-bold text-primary/80 uppercase truncate max-w-[120px]">
                            {stock.moat || stock.sector}
                        </span>
                        <Badge variant="secondary" className="text-[8px] h-4 px-1 uppercase whitespace-nowrap bg-primary/5 text-primary border-primary/20">
                            {stock.tag || "QUALIFIED"}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
