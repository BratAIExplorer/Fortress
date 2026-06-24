
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingDown, Target, Zap, ChevronDown, ChevronUp, RadioTower, Info } from "lucide-react";
import { V5Stock } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatPrice, getMarket } from "@/lib/markets/config";

function getHumanMbSummary(stock: V5Stock): string | null {
    if (!stock.mbTier) return null;
    const tierMap: Record<string, string> = {
        "Rocket": "Strong multi-bagger structure — all growth drivers aligned",
        "Launcher": "Solid growth potential — most key drivers in place",
        "Builder": "Growing into a potential compounder — watch for improvement",
        "Crawler": "Limited growth signals — only 1-2 factors present",
        "Grounded": "Multi-bagger conditions not currently present",
    };
    return tierMap[stock.mbTier] ?? null;
}

function getHumanInsights(stock: V5Stock): string[] {
    const insights: string[] = [];

    if (stock.fcfYieldPct && stock.fcfYieldPct > 3) {
        insights.push("Generates strong free cash — the business makes real money, not just paper profits");
    }

    if (stock.pegRatio && stock.pegRatio > 0 && stock.pegRatio < 1.0) {
        insights.push("Growth is cheaper than its price suggests — you're paying less for future earnings");
    } else if (stock.pegRatio && stock.pegRatio >= 1.0 && stock.pegRatio < 1.5) {
        insights.push("Fairly priced for its growth rate");
    }

    if (stock.deDirection === "falling") {
        insights.push("Actively paying down debt — financial strength is improving");
    } else if (stock.deDirection === "rising") {
        insights.push("Debt is increasing — worth monitoring why");
    }

    if (stock.marginDirection === "expanding") {
        insights.push("Becoming more profitable over time — a sign of pricing power or efficiency gains");
    } else if (stock.marginDirection === "contracting") {
        insights.push("Profit margins are shrinking — may face cost pressure or competition");
    }

    return insights;
}

function generateScannerThesis(stock: V5Stock) {
    const passes = [stock.l1, stock.l2, stock.l3, stock.l4, stock.l5, stock.l6].filter(v => v === 1).length;
    const items = [];

    const mbSummary = getHumanMbSummary(stock);
    if (mbSummary) items.push(mbSummary + ".");

    items.push(`Passed ${passes} of 6 independent safety checks.`);

    const humanInsights = getHumanInsights(stock);
    if (humanInsights.length > 0) {
        items.push(humanInsights[0] + ".");
    }

    if (items.length === 0) return "Selected by our screening engine based on multiple quality and growth signals.";

    return items.join(" ");
}

function TechnicalDetail({ stock }: { stock: V5Stock }) {
    const [open, setOpen] = useState(false);
    const layers = [
        { code: "L1", name: "Financial Safety", score: stock.l1 },
        { code: "L2", name: "Pricing Power", score: stock.l2 },
        { code: "L3", name: "Market Momentum", score: stock.l3 },
        { code: "L4", name: "Growth Visibility", score: stock.l4 },
        { code: "L5", name: "Ownership Quality", score: stock.l5 },
        { code: "L6", name: "Valuation Check", score: stock.l6 },
    ];

    return (
        <div className="border-t border-border/50 pt-2">
            <button
                onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
                className="flex items-center gap-1 text-[9px] text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
            >
                {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {open ? "Hide technical detail" : "Why this stock? (technical)"}
            </button>
            {open && (
                <div className="mt-2 space-y-2 text-[9px]">
                    <div className="grid grid-cols-2 gap-1">
                        {layers.map((l) => (
                            <div key={l.code} className="flex items-center justify-between bg-white/5 rounded px-1.5 py-0.5">
                                <span className="text-muted-foreground">{l.code}: {l.name}</span>
                                <span className={l.score === 1 ? "text-emerald-400" : "text-destructive"}>
                                    {l.score === 1 ? "Pass" : "Fail"}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                        {stock.mbScore != null && (
                            <div className="flex items-center justify-between bg-white/5 rounded px-1.5 py-0.5">
                                <span className="text-muted-foreground">MB Score</span>
                                <span className="text-white font-mono">{stock.mbScore}/100 · {stock.mbTier}</span>
                            </div>
                        )}
                        {stock.fcfYieldPct != null && (
                            <div className="flex items-center justify-between bg-white/5 rounded px-1.5 py-0.5">
                                <span className="text-muted-foreground">FCF Yield</span>
                                <span className="text-white font-mono">{stock.fcfYieldPct}%</span>
                            </div>
                        )}
                        {stock.pegRatio != null && stock.pegRatio > 0 && (
                            <div className="flex items-center justify-between bg-white/5 rounded px-1.5 py-0.5">
                                <span className="text-muted-foreground">PEG Ratio</span>
                                <span className="text-white font-mono">{stock.pegRatio.toFixed(2)}</span>
                            </div>
                        )}
                        {stock.deDirection && stock.deDirection !== "unknown" && (
                            <div className="flex items-center justify-between bg-white/5 rounded px-1.5 py-0.5">
                                <span className="text-muted-foreground">Debt Trend</span>
                                <span className={cn("font-mono",
                                    stock.deDirection === "falling" ? "text-emerald-400" :
                                    stock.deDirection === "rising" ? "text-destructive" : "text-amber-400"
                                )}>{stock.deDirection}</span>
                            </div>
                        )}
                        {stock.marginDirection && stock.marginDirection !== "unknown" && (
                            <div className="flex items-center justify-between bg-white/5 rounded px-1.5 py-0.5">
                                <span className="text-muted-foreground">Margin Trend</span>
                                <span className={cn("font-mono",
                                    stock.marginDirection === "expanding" ? "text-emerald-400" :
                                    stock.marginDirection === "contracting" ? "text-destructive" : "text-amber-400"
                                )}>{stock.marginDirection}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
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
                            <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 cursor-default">
                                            <Badge variant={stock.quality_score >= 80 ? "default" : "outline"} className="font-mono text-xs">
                                                QS: {stock.quality_score}
                                            </Badge>
                                            <Info className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="left" className="max-w-[220px] text-xs">
                                        Quality Score (0–100): How well this company scores across 6 independent checks — financial safety, pricing power, momentum, growth, ownership quality, and valuation.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 cursor-default">
                                            <span className="text-[10px] text-muted-foreground font-mono">OCF: {stock.ocf || "N/A"}</span>
                                            <Info className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="left" className="max-w-[220px] text-xs">
                                        Operating Cash Flow ({getMarket(market).currency} {getMarket(market).unit}): Real cash the business generates from its day-to-day operations. Positive means the company makes money — not just on paper, but in actual cash.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
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

                    {/* Growth Potential Summary — plain English */}
                    {stock.isLivePick && stock.mbScore != null && (
                        <div className="text-[10px] border border-emerald-500/20 bg-emerald-500/5 rounded-sm px-2 py-1.5 space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Growth Potential</span>
                                <span className={cn(
                                    "font-bold",
                                    stock.mbScore >= 80 ? "text-emerald-400" :
                                    stock.mbScore >= 60 ? "text-blue-400" :
                                    stock.mbScore >= 40 ? "text-amber-400" : "text-muted-foreground"
                                )}>
                                    {stock.mbScore >= 80 ? "Very High" :
                                     stock.mbScore >= 60 ? "High" :
                                     stock.mbScore >= 40 ? "Moderate" : "Low"}
                                </span>
                            </div>
                            {getHumanMbSummary(stock) && (
                                <p className="text-[9px] text-muted-foreground leading-relaxed">
                                    {getHumanMbSummary(stock)}
                                </p>
                            )}
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
                                            { label: "Financial Safety", p: stock.l1 },
                                            { label: "Pricing Power", p: stock.l2 },
                                            { label: "Market Momentum", p: stock.l3 },
                                            { label: "Growth Visibility", p: stock.l4 },
                                            { label: "Ownership Quality", p: stock.l5 },
                                            { label: "Valuation Check", p: stock.l6 },
                                        ].map((layer, i) => layer.p === 1 && (
                                            <span key={i} className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1 py-0.5 rounded border border-emerald-500/20">
                                                {layer.label} ✓
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Key Insights — plain English signals */}
                        {stock.isLivePick && (() => {
                            const insights = getHumanInsights(stock);
                            if (insights.length === 0) return null;
                            return (
                                <div className="space-y-1.5 border-t border-border/50 pt-3">
                                    <div className="text-[10px] font-bold text-blue-400 uppercase tracking-tight">
                                        Key Insights
                                    </div>
                                    <ul className="space-y-1">
                                        {insights.map((insight, i) => (
                                            <li key={i} className="text-[10px] leading-relaxed text-muted-foreground flex gap-1.5">
                                                <span className="text-blue-400 shrink-0">•</span>
                                                {insight}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })()}

                        {/* Speculative Fields */}
                        {stock.multi_bagger_case && (
                            <div className="space-y-1.5 border-t border-border/50 pt-3">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500 uppercase tracking-tight">
                                    <Zap className="h-3 w-3" /> Why This Could Be Big
                                </div>
                                <p className="text-[11px] leading-relaxed text-muted-foreground md:line-clamp-2 md:group-hover:line-clamp-none transition-all duration-300">
                                    {stock.multi_bagger_case}
                                </p>
                            </div>
                        )}

                        {/* Technical Detail — expandable for transparency */}
                        {stock.isLivePick && stock.mbScore != null && (
                            <TechnicalDetail stock={stock} />
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
