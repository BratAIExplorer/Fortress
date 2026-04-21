"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RadioTower, TrendingDown, TrendingUp, Minus, ChevronDown, ChevronUp, CheckCircle2, XCircle } from "lucide-react";
import { ScannerCandidate } from "@/lib/types";
import { formatPrice, getMarket } from "@/lib/markets/config";
import { cn } from "@/lib/utils";

const TIER_COLORS: Record<string, string> = {
    Rocket:   "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
    Launcher: "text-blue-400 border-blue-500/40 bg-blue-500/10",
    Builder:  "text-amber-400 border-amber-500/40 bg-amber-500/10",
    Crawler:  "text-orange-400 border-orange-500/40 bg-orange-500/10",
    Grounded: "text-red-400 border-red-500/40 bg-red-500/10",
};

const CRITERIA = [
    { key: "l1Pass", label: "Profitability", detail: "ROCE > 15%" },
    { key: "l2Pass", label: "Debt Quality",  detail: "D/E < 0.5" },
    { key: "l3Pass", label: "Free Cash Flow", detail: "Positive FCF" },
    { key: "l4Pass", label: "Revenue Growth", detail: "3yr CAGR > 10%" },
    { key: "l5Pass", label: "Momentum",       detail: "Price > 200-day MA" },
    { key: "l6Pass", label: "Valuation",      detail: "PEG < 1.5" },
] as const;

function DirectionIcon({ direction }: { direction: string | null }) {
    if (direction === "falling" || direction === "expanding")
        return <TrendingDown className="h-3 w-3 text-emerald-400" />;
    if (direction === "rising" || direction === "contracting")
        return <TrendingUp className="h-3 w-3 text-destructive" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
}

function CriterionRow({
    label,
    detail,
    pass,
}: {
    label: string;
    detail: string;
    pass: boolean | null;
}) {
    if (pass === null) return null;
    return (
        <div className="flex items-center justify-between gap-2 py-1 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-2 min-w-0">
                {pass
                    ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    : <XCircle      className="h-3.5 w-3.5 text-red-400 shrink-0" />}
                <span className={cn("text-[11px] font-medium truncate", pass ? "text-white" : "text-muted-foreground")}>
                    {label}
                </span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono shrink-0">{detail}</span>
        </div>
    );
}

function generateCandidateThesis(candidate: ScannerCandidate) {
    const passes = [
        candidate.l1Pass, candidate.l2Pass, candidate.l3Pass,
        candidate.l4Pass, candidate.l5Pass, candidate.l6Pass,
    ].filter(v => v === true).length;

    const items = [];
    if (candidate.mbTier && candidate.mbTier !== "Grounded") {
        items.push(`Qualified as a **${candidate.mbTier}** grade asset.`);
    }

    const highlights = [];
    if (candidate.l1Pass) highlights.push("Profitability");
    if (candidate.l2Pass) highlights.push("Debt Safety");
    
    let base = `Met **${passes}/6** internal quality benchmarks`;
    if (highlights.length > 0) {
        base += ` including ${highlights.join(" and ")}`;
    }
    items.push(base + ".");

    if (candidate.fcfYieldPct && candidate.fcfYieldPct > 0) {
        items.push(`FCF Yield: **${candidate.fcfYieldPct.toFixed(1)}%**.`);
    }

    if (candidate.pegRatio && candidate.pegRatio > 0 && candidate.pegRatio < 1.5) {
        items.push("Valuation appears attractive relative to growth.");
    }

    return items.join(" ");
}

export function ScannerCandidateCard({ candidate }: { candidate: ScannerCandidate }) {
    const [showWhy, setShowWhy] = useState(false);
    const tierColor = TIER_COLORS[candidate.mbTier] ?? "text-muted-foreground border-white/20 bg-white/5";
    const market = getMarket(candidate.market);
    const hasCriteria = [
        candidate.l1Pass, candidate.l2Pass, candidate.l3Pass,
        candidate.l4Pass, candidate.l5Pass, candidate.l6Pass,
    ].some(v => v !== null);

    return (
        <motion.div whileHover={{ y: -2 }} className="group h-full">
            <Card className="h-full overflow-hidden border-emerald-500/20 bg-card/50 backdrop-blur transition-all hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5">
                <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                                <RadioTower className="h-3 w-3 text-emerald-400 shrink-0" />
                                <Link
                                    href={`/stocks/${candidate.symbol.replace(/\.(NS|BO)$/i, "").toLowerCase()}`}
                                    className="font-serif text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors truncate"
                                >
                                    {candidate.symbol.replace(/\.(NS|BO)$/i, "")}
                                </Link>
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="text-[10px] text-muted-foreground font-mono">
                                    {formatPrice(candidate.price, candidate.market)}
                                </p>
                                <span className="text-[9px] text-muted-foreground/60">{market.flag}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                            <Badge className={cn("font-mono text-[10px] border", tierColor)}>
                                {candidate.mbTier}
                            </Badge>
                            <span className="text-[10px] font-bold text-emerald-400 font-mono">
                                MB {candidate.mbScore}
                            </span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-4 pt-2 space-y-3">
                    {candidate.megatrend && (
                        <span className="inline-flex items-center gap-1 rounded-sm bg-secondary/10 px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                            {candidate.megatrendEmoji} {candidate.megatrend}
                        </span>
                    )}

                    <div className="grid grid-cols-3 gap-2 text-[9px] font-mono">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-muted-foreground uppercase">Score</span>
                            <span className="text-white font-bold">{candidate.totalScore}</span>
                        </div>
                        {candidate.fcfYieldPct != null && (
                            <div className="flex flex-col gap-0.5">
                                <span className="text-muted-foreground uppercase">FCF Yld</span>
                                <span className="text-white font-bold">{candidate.fcfYieldPct.toFixed(1)}%</span>
                            </div>
                        )}
                        <div className="flex flex-col gap-0.5">
                            <span className="text-muted-foreground uppercase">Debt</span>
                            <DirectionIcon direction={candidate.deDirection} />
                        </div>
                    </div>

                    <div className="space-y-1.5 min-h-[40px]">
                        <p className="text-[10px] leading-relaxed text-muted-foreground line-clamp-3">
                            {generateCandidateThesis(candidate)}
                        </p>
                    </div>

                    {/* Why Selected toggle */}
                    {hasCriteria && (
                        <>
                            <button
                                onClick={() => setShowWhy(v => !v)}
                                className="w-full flex items-center justify-between text-[10px] text-emerald-400/80 hover:text-emerald-400 transition-colors pt-1 border-t border-white/5"
                            >
                                <span className="font-bold uppercase tracking-widest">
                                    Why Selected
                                </span>
                                {showWhy
                                    ? <ChevronUp className="h-3 w-3" />
                                    : <ChevronDown className="h-3 w-3" />}
                            </button>

                            <AnimatePresence>
                                {showWhy && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pt-1 space-y-0">
                                            {CRITERIA.map(({ key, label, detail }) => (
                                                <CriterionRow
                                                    key={key}
                                                    label={label}
                                                    detail={detail}
                                                    pass={(candidate as any)[key]}
                                                />
                                            ))}
                                        </div>
                                        {candidate.scanRunAt && (
                                            <p className="text-[9px] text-muted-foreground/50 mt-2 font-mono">
                                                Scanned {new Date(candidate.scanRunAt).toLocaleDateString("en-GB", {
                                                    day: "numeric", month: "short", year: "numeric"
                                                })}
                                            </p>
                                        )}
                                        <p className="text-[8px] text-muted-foreground/40 mt-1">
                                            Not financial advice. Do your own research.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    )}

                    {!hasCriteria && (
                        <p className="text-[9px] text-emerald-500/60 uppercase tracking-widest font-mono pt-1">
                            Scanner Detected · No Editorial Review
                        </p>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
