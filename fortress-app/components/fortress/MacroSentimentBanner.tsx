import Link from "next/link";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface MacroSnapshotSummary {
    snapshotDate: string;
    nifty50: string | null;
    indiaVix: string | null;
    cboeVix: string | null;
    usdInr: string | null;
    goldUsd: string | null;
    crudeOilUsd: string | null;
    us10yYield: string | null;
    bankNifty: string | null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function parseNum(s: string | null): number | null {
    if (s == null) return null;
    const n = parseFloat(s);
    return isNaN(n) ? null : n;
}

type Sentiment = "bullish" | "cautious" | "bearish" | "neutral";

interface SentimentResult {
    sentiment: Sentiment;
    label: string;
    emoji: string;
    colorClass: string;
}

function deriveSentiment(snapshot: MacroSnapshotSummary): SentimentResult {
    const indiaVix = parseNum(snapshot.indiaVix);
    const cboeVix = parseNum(snapshot.cboeVix);

    // Use India VIX as primary signal; fall back to CBOE VIX
    const vix = indiaVix ?? cboeVix;

    if (vix == null) {
        return { sentiment: "neutral", label: "Neutral", emoji: "⚪", colorClass: "text-slate-400" };
    }

    if (vix < 14) {
        return { sentiment: "bullish", label: "Bullish", emoji: "📈", colorClass: "text-emerald-400" };
    }
    if (vix < 20) {
        return { sentiment: "cautious", label: "Cautious", emoji: "⚠️", colorClass: "text-amber-400" };
    }
    return { sentiment: "bearish", label: "Bearish", emoji: "🔴", colorClass: "text-red-400" };
}

interface DataPillProps {
    label: string;
    value: string;
    trend?: "up" | "down" | "flat";
    invertTrend?: boolean; // true = up is bad (VIX, USD/INR)
}

function DataPill({ label, value, trend, invertTrend }: DataPillProps) {
    const isGood = trend == null
        ? null
        : invertTrend
            ? trend === "down"
            : trend === "up";

    const TrendIcon =
        trend === "up" ? TrendingUp :
        trend === "down" ? TrendingDown :
        Minus;

    return (
        <span className="flex items-center gap-1 text-xs text-slate-300 whitespace-nowrap">
            <span className="text-slate-500 hidden sm:inline">{label}</span>
            <span className="font-mono font-semibold text-white">{value}</span>
            {trend != null && (
                <TrendIcon
                    className={cn(
                        "h-3 w-3 shrink-0",
                        isGood === true ? "text-emerald-400" :
                        isGood === false ? "text-red-400" :
                        "text-slate-400"
                    )}
                />
            )}
        </span>
    );
}

// ─── Main Banner ───────────────────────────────────────────────────────────────

interface MacroSentimentBannerProps {
    snapshot: MacroSnapshotSummary | null;
}

export function MacroSentimentBanner({ snapshot }: MacroSentimentBannerProps) {
    if (!snapshot) {
        return null;
    }

    const { emoji, label, colorClass } = deriveSentiment(snapshot);

    const vixVal = parseNum(snapshot.indiaVix) ?? parseNum(snapshot.cboeVix);
    const niftyVal = parseNum(snapshot.nifty50);
    const usdInrVal = parseNum(snapshot.usdInr);

    const vixLabel = snapshot.indiaVix != null ? "India VIX" : "CBOE VIX";
    const vixTrend: "up" | "down" | "flat" | undefined =
        vixVal == null ? undefined : vixVal < 14 ? "down" : vixVal > 20 ? "up" : "flat";

    return (
        <div className="w-full rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
            {/* Sentiment indicator */}
            <div className="flex items-center gap-2 shrink-0">
                <span className="text-base leading-none">{emoji}</span>
                <span className={cn("text-xs font-bold uppercase tracking-wide", colorClass)}>
                    {label}
                </span>
                <span className="hidden sm:inline text-[10px] text-slate-500 uppercase tracking-widest">
                    Market Sentiment
                </span>
            </div>

            {/* Key data points */}
            <div className="flex items-center gap-3 flex-wrap">
                {niftyVal != null && (
                    <DataPill
                        label="Nifty"
                        value={niftyVal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    />
                )}
                {vixVal != null && (
                    <DataPill
                        label={vixLabel}
                        value={vixVal.toFixed(1)}
                        trend={vixTrend}
                        invertTrend
                    />
                )}
                {usdInrVal != null && (
                    <DataPill
                        label="USD/INR"
                        value={`₹${usdInrVal.toFixed(2)}`}
                    />
                )}
            </div>

            {/* Link to full analysis */}
            <Link
                href="/macro"
                className="text-[11px] text-amber-400/80 hover:text-amber-400 underline underline-offset-2 shrink-0 transition-colors whitespace-nowrap"
            >
                Full Analysis →
            </Link>
        </div>
    );
}
