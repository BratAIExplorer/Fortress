
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingDown, Target, Zap, ChevronDown, ChevronUp, RadioTower } from "lucide-react";
import { V5Stock } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/markets/config";

function generateScannerThesis(stock: V5Stock) {
    const passes = [stock.l1, stock.l2, stock.l3, stock.l4, stock.l5, stock.l6].filter(v => v === 1).length;
    const items = [];

    if (stock.mbTier) {
        items.push(`Detected as a high-potential **${stock.mbTier}** candidate.`);
    }

    const gateNames = [];
    if (stock.l1) gateNames.push("Financial Safety");
    if (stock.l2) gateNames.push("Pricing Power");
    
    let gatesText = `Passed **${passes}/6** fundamental quality gates`;
    if (gateNames.length > 0) {
        gatesText += ` including ${gateNames.join(" and ")}`;
    }
    items.push(gatesText + ".");

    if (stock.fcfYieldPct) {
        items.push(`Free Cash Flow yield is attractive at **${stock.fcfYieldPct}%**.`);
    }

    if (stock.pegRatio && stock.pegRatio > 0) {
        items.push(`Growth-adjusted valuation (PEG) is **${stock.pegRatio.toFixed(2)}**, suggesting undervaluation relative to earnings trajectory.`);
    }

    if (stock.deDirection === 'falling') {
        items.push("Demonstrating financial strengthening with a falling debt profile.");
    }

    if (stock.marginDirection === 'expanding') {
        items.push("Operational efficiency is improving with expanding profit margins.");
    }

    if (items.length === 0) return "Selected based on multi-factor fundamental and momentum anomalies.";

    return items.join(" ");
}

export function V5StockCard({ stock, market = "NSE" }: { stock: V5Stock, market?: string }) {
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
                            {stock.isLivePick && (
                                <Badge className="font-mono text-[9px] h-4 px-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 gap-1">
                                    <RadioTower className="h-2.5 w-2.5" /> Live Scan
                                </Badge>
                            )}
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
                            <span className="font-bold text-white text-xs">{formatPrice(stock.current_price, market)}</span>
                        </div>
                        <div className="flex flex-col text-right">
                            <span className="text-muted-foreground uppercase text-[9px]">52W Drop</span>
                            <span className="font-bold text-destructive text-xs">
                                {stock.drop52w ? `${stock.drop52w}%` : "–"}
                            </span>
                        </div>
                    </div>

                    {/* Mobile Detail Toggle Indicator */}
                    <div className="flex md:hidden items-center justify-center py-1 text-muted-foreground transition-colors group-hover:text-primary">
                        {showDetail ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        <span className="text-[9px] uppercase tracking-widest ml-1">{showDetail ? "Hide Analysis" : "Show Analysis"}</span>
                    </div>

                    {/* Live Scan metrics row */}
                    {stock.isLivePick && stock.mbScore != null && (
                        <div className="flex items-center justify-between text-[10px] border border-emerald-500/20 bg-emerald-500/5 rounded-sm px-2 py-1.5">
                            <span className="text-muted-foreground uppercase tracking-wide">MB Score</span>
                            <span className="font-bold text-emerald-400">{stock.mbScore} · {stock.mbTier}</span>
                        </div>
                    )}

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

                        {/* Automated Scanner Thesis or Manual Fortress View */}
                        {(stock.why_buy || stock.isLivePick) && (
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-tight">
                                    <Target className="h-3 w-3" /> 
                                    {stock.isLivePick && !stock.why_buy ? "Scanner Selection Logic" : "Fortress View"}
                                </div>
                                <p className="text-[11px] leading-relaxed text-slate-200 font-medium">
                                    {stock.why_buy || generateScannerThesis(stock)}
                                </p>
                                {stock.isLivePick && !stock.why_buy && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {[
                                            { label: "L1: Quality", p: stock.l1 },
                                            { label: "L2: Moat", p: stock.l2 },
                                            { label: "L3: Macro", p: stock.l3 },
                                            { label: "L4: Growth", p: stock.l4 },
                                            { label: "L5: Gov", p: stock.l5 },
                                            { label: "L6: Mom", p: stock.l6 },
                                        ].map((layer, i) => layer.p === 1 && (
                                            <span key={i} className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1 py-0.5 rounded border border-emerald-500/20">
                                                {layer.label} ✓
                                            </span>
                                        ))}
                                    </div>
                                )}
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
