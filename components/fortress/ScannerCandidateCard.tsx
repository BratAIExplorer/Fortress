"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RadioTower, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { ScannerCandidate } from "@/lib/types";
import { cn } from "@/lib/utils";

const TIER_COLORS: Record<string, string> = {
    Rocket: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
    Launcher: "text-blue-400 border-blue-500/40 bg-blue-500/10",
    Builder: "text-amber-400 border-amber-500/40 bg-amber-500/10",
    Crawler: "text-orange-400 border-orange-500/40 bg-orange-500/10",
    Grounded: "text-red-400 border-red-500/40 bg-red-500/10",
};

function DirectionIcon({ direction }: { direction: string | null }) {
    if (direction === "falling" || direction === "expanding") return <TrendingDown className="h-3 w-3 text-emerald-400" />;
    if (direction === "rising" || direction === "contracting") return <TrendingUp className="h-3 w-3 text-destructive" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
}

export function ScannerCandidateCard({ candidate }: { candidate: ScannerCandidate }) {
    const tierColor = TIER_COLORS[candidate.mbTier] ?? "text-muted-foreground border-white/20 bg-white/5";

    return (
        <motion.div whileHover={{ y: -4 }} className="group h-full">
            <Card className="h-full overflow-hidden border-emerald-500/20 bg-card/50 backdrop-blur transition-all hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5">
                <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <div className="flex items-center gap-1.5 mb-1">
                                <RadioTower className="h-3 w-3 text-emerald-400" />
                                <h3 className="font-serif text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                                    {candidate.symbol}
                                </h3>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-mono">₹{candidate.price.toFixed(2)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <Badge className={cn("font-mono text-[10px] border", tierColor)}>
                                {candidate.mbTier}
                            </Badge>
                            <span className="text-[10px] font-bold text-emerald-400 font-mono">MB {candidate.mbScore}</span>
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

                    <p className="text-[9px] text-emerald-500/60 uppercase tracking-widest font-mono pt-1">
                        Scanner Detected · No Editorial Review
                    </p>

                    <div className="border-t border-white/10 pt-2 mt-2">
                        <p className="text-[8px] text-muted-foreground">
                            Not financial advice. Consult an advisor before investing.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
