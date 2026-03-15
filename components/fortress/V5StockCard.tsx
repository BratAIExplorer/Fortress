
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingDown, Target, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { V5Stock } from "@/lib/types";
import { cn } from "@/lib/utils";

export function V5StockCard({ stock }: { stock: V5Stock }) {
    const [showDetail, setShowDetail] = useState(false);

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="group relative h-full flex flex-col"
        >
            <Card className="flex-1 overflow-hidden border-primary/20 bg-card/50 backdrop-blur transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 cursor-pointer md:cursor-default" onClick={() => setShowDetail(!showDetail)}>
                <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-serif text-xl font-bold tracking-tight text-white group-hover:text-primary transition-colors">{stock.symbol}</h3>
                                {stock.risk === "EXTREME" && <Zap className="h-3 w-3 text-destructive animate-pulse" />}
                            </div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stock.name}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <Badge variant={stock.quality_score >= 80 ? "default" : "outline"} className="font-mono text-xs">
                                QS: {stock.quality_score}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground font-mono">OCF: {stock.ocf || "N/A"}</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 flex flex-col h-full space-y-4">
                    {/* Key Stats Row */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] bg-secondary/20 p-2 rounded-sm border border-border/50">
                        <div className="flex flex-col">
                            <span className="text-muted-foreground uppercase text-[9px]">CMP</span>
                            <span className="font-bold text-white text-xs">₹{stock.current_price}</span>
                        </div>
                        <div className="flex flex-col text-right">
                            <span className="text-muted-foreground uppercase text-[9px]">52W Drop</span>
                            <span className="font-bold text-destructive text-xs">{stock.drop52w}%</span>
                        </div>
                    </div>

                    {/* Mobile Detail Toggle Indicator */}
                    <div className="flex md:hidden items-center justify-center py-1 text-muted-foreground transition-colors group-hover:text-primary">
                        {showDetail ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        <span className="text-[9px] uppercase tracking-widest ml-1">{showDetail ? "Hide Analysis" : "Show Analysis"}</span>
                    </div>

                    {/* Content Section (Auto-expand on desktop hover OR mobile toggle) */}
                    <div className={cn(
                        "space-y-4 transition-all duration-300",
                        showDetail ? "block" : "hidden md:block"
                    )}>
                        {/* The "Why" Section */}
                        {stock.why_down && (
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-destructive uppercase tracking-tight">
                                    <TrendingDown className="h-3 w-3" /> Why It Fell
                                </div>
                                <p className="text-[11px] leading-relaxed text-muted-foreground italic md:line-clamp-2 md:group-hover:line-clamp-none transition-all duration-300">
                                    &ldquo;{stock.why_down}&rdquo;
                                </p>
                            </div>
                        )}

                        {stock.why_buy && (
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-tight">
                                    <Target className="h-3 w-3" /> Fortress View
                                </div>
                                <p className="text-[11px] leading-relaxed text-slate-200 font-medium">
                                    {stock.why_buy}
                                </p>
                            </div>
                        )}

                        {/* Speculative Fields */}
                        {stock.multi_bagger_case && (
                            <div className="space-y-1.5 border-t border-border/50 pt-3">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500 uppercase tracking-tight">
                                    <Zap className="h-3 w-3" /> Multi-Bagger Case
                                </div>
                                <p className="text-[11px] leading-relaxed text-muted-foreground md:line-clamp-2 md:group-hover:line-clamp-none transition-all duration-300">
                                    {stock.multi_bagger_case}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Tag / Moat - Fixed at bottom */}
                    <div className="flex items-center justify-between pt-4 mt-auto border-t border-border/30">
                        <span className="text-[10px] font-bold text-primary uppercase truncate max-w-[120px]">
                            {stock.moat || stock.sector}
                        </span>
                        <Badge variant="secondary" className="text-[9px] h-5 px-2 uppercase whitespace-nowrap bg-primary/5 text-primary border-primary/20">
                            {stock.tag || "QUALIFIED"}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
