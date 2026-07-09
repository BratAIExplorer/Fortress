"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiTimeframeItem {
  timeframe: string;
  ema_or_sma: string;
  value: string;
  trigger: string;
  triggerType: "bullish" | "neutral" | "bearish";
}

interface MultiTimeframeSetupCardProps {
  item: MultiTimeframeItem;
}

// Plain-English explanations for non-techie traders
const EXPLANATIONS: Record<string, { simple: string; tooltip: string }> = {
  "Daily / EMA(21)": {
    simple: "Short-term trend (last 3-4 weeks)",
    tooltip:
      "EMA(21) shows where the stock is trending over the past 3-4 weeks. If price is ABOVE it → momentum is up. If BELOW → momentum is down.",
  },
  "Weekly / SMA(50)": {
    simple: "Medium-term trend (last 2-3 months)",
    tooltip:
      "SMA(50) shows the average price over the past 2-3 months. Use this to spot changes in direction over weeks.",
  },
  "Monthly / SMA(200)": {
    simple: "Long-term trend (past year)",
    tooltip:
      "SMA(200) is the 'big picture' — shows if the stock is in an uptrend or downtrend over 1+ years. Most important line for buy & hold.",
  },
  "Volatility / ATR(14)": {
    simple: "How much price swings (risk measure)",
    tooltip:
      "ATR tells you the typical daily price move. Use the 'Stop' level to set your exit point if things go wrong.",
  },
};

export function MultiTimeframeSetupCard({
  item,
}: MultiTimeframeSetupCardProps) {
  const [showTechnical, setShowTechnical] = useState(false);

  const key =
    item.timeframe === "Volatility"
      ? `${item.timeframe} / ${item.ema_or_sma}`
      : `${item.timeframe} / ${item.ema_or_sma}`;

  const explanation = EXPLANATIONS[key] || {
    simple: `${item.timeframe} timeframe analysis`,
    tooltip: "Technical analysis metric",
  };

  // Color based on trigger type
  const bgColor =
    item.triggerType === "bullish"
      ? "bg-green-500/5 border-green-500/30 hover:bg-green-500/10"
      : item.triggerType === "bearish"
        ? "bg-red-500/5 border-red-500/30 hover:bg-red-500/10"
        : "bg-amber-500/5 border-amber-500/30 hover:bg-amber-500/10";

  const triggerColor =
    item.triggerType === "bullish"
      ? "text-green-600 dark:text-green-400"
      : item.triggerType === "bearish"
        ? "text-red-600 dark:text-red-400"
        : "text-amber-600 dark:text-amber-400";

  // Interpretation for regular traders
  const getInterpretation = (): string => {
    if (item.timeframe === "Volatility") {
      return "Sets your risk. If it rises, swings get bigger.";
    }
    if (item.triggerType === "bullish") {
      return "✓ Tailwind — price is in an uptrend";
    }
    if (item.triggerType === "bearish") {
      return "⚠ Headwind — price is in a downtrend";
    }
    return "→ No clear direction — wait for a move";
  };

  return (
    <Card className={cn("border transition-all cursor-pointer", bgColor)}>
      <CardContent className="p-3 space-y-2">
        {/* Timeframe Label + Help Icon */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
              {item.timeframe}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
              {explanation.simple}
            </p>
          </div>
          <button
            onClick={() => setShowTechnical(!showTechnical)}
            className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 p-1"
            title="Show technical details"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Price/Value Display */}
        <div className="text-center py-1.5 bg-background/50 rounded px-2">
          <p className="text-sm font-bold text-foreground">{item.value}</p>
        </div>

        {/* Signal with Icon + Plain English Interpretation */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {item.triggerType === "bullish" && (
            <TrendingUp className="h-3.5 w-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
          )}
          {item.triggerType === "bearish" && (
            <TrendingDown className="h-3.5 w-3.5 text-red-600 dark:text-red-400 flex-shrink-0" />
          )}
          {item.triggerType === "neutral" && (
            <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          )}
          <p className={cn("text-xs font-medium text-center", triggerColor)}>
            {item.trigger}
          </p>
        </div>

        {/* Human-Readable Interpretation */}
        <div className="text-xs text-muted-foreground text-center italic pt-1 pb-2">
          {getInterpretation()}
        </div>

        {/* Expandable Technical Details */}
        {showTechnical && (
          <div className="border-t border-border/50 pt-2 space-y-1.5">
            <div className="bg-muted/30 rounded p-2 space-y-1">
              <p className="text-xs font-semibold text-foreground">
                💡 For traders:
              </p>
              <p className="text-xs text-muted-foreground leading-snug">
                {explanation.tooltip}
              </p>
            </div>

            {/* Technical Details Row */}
            <div className="bg-muted/20 rounded p-2 space-y-0.5">
              <p className="text-xs font-mono text-muted-foreground">
                <span className="font-semibold">Indicator:</span> {item.ema_or_sma}
              </p>
              <p className="text-xs font-mono text-muted-foreground">
                <span className="font-semibold">Level:</span> {item.value}
              </p>
              <p className="text-xs font-mono text-muted-foreground">
                <span className="font-semibold">Status:</span> {item.trigger}
              </p>
            </div>
          </div>
        )}

        {!showTechnical && (
          <p className="text-xs text-muted-foreground/60 text-center flex items-center justify-center gap-1 pt-1">
            <ChevronDown className="h-2.5 w-2.5" />
            <span>Click for details</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
