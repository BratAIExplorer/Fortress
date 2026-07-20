"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, AlertCircle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BottomLineInsight, TradeSignal } from "@/lib/types/trading-specialist";

interface DecisionPanelProps {
  signals: TradeSignal[];
  bottomLine: BottomLineInsight;
  onBuyClick: () => void;
  onSkipClick: () => void;
}

export function DecisionPanel({
  signals,
  bottomLine,
  onBuyClick,
  onSkipClick,
}: DecisionPanelProps) {
  // Calculate consensus
  const avgConfidence = Math.round(
    signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length
  );
  const bullishCount = signals.filter(s => s.direction === 'bullish').length;
  const bearishCount = signals.filter(s => s.direction === 'bearish').length;

  // Determine verdict
  const verdict = !signals[0]
    ? 'NEUTRAL'
    : signals[0].confidence >= 80 && bullishCount >= 2
      ? 'BUY'
      : signals[0].confidence >= 80 && bearishCount >= 2
        ? 'SELL'
        : 'WATCH';

  const verdictColor =
    verdict === 'BUY'
      ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
      : verdict === 'SELL'
        ? 'bg-red-500/20 border-red-500/30 text-red-300'
        : 'bg-amber-500/20 border-amber-500/30 text-amber-300';

  const primarySignal = signals[0];

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="pb-4 border-b border-primary/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Decision Panel
            </p>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">{avgConfidence}%</span>
                <span className="text-sm text-muted-foreground">Average confidence</span>
              </div>
              <div className="flex gap-3 text-sm">
                <span className="text-muted-foreground">
                  📈 {bullishCount} bullish
                </span>
                <span className="text-muted-foreground">
                  ⚠️ {signals.length - Math.max(bullishCount, bearishCount)} diverging
                </span>
              </div>
            </div>
          </div>
          <div className={cn('px-4 py-2 rounded-lg border font-bold text-lg', verdictColor)}>
            {verdict}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Primary Signal */}
        {primarySignal && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Primary Signal
            </p>
            <div className="bg-secondary/30 rounded-lg p-4 border border-primary/10">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-xl font-bold text-foreground">
                    {primarySignal.label}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {primarySignal.timeframe === "intraday"
                      ? "Intraday (immediate)"
                      : primarySignal.timeframe === "shortTerm"
                        ? "Short-term (1–6 months)"
                        : "Long-term (1+ years)"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">
                    {primarySignal.confidence}%
                  </p>
                  <p className="text-xs text-muted-foreground">confidence</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Line */}
        <div className="space-y-3 border-t border-primary/10 pt-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            The Bottom Line
          </p>
          <div>
            <p className="font-medium text-sm text-foreground mb-1">
              {bottomLine.headline}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {bottomLine.body}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 border-t border-primary/10 pt-4">
          <Button
            size="lg"
            variant="default"
            onClick={onBuyClick}
            className="flex-1 gap-2 text-base"
          >
            <TrendingUp className="h-4 w-4" />
            Bought
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onSkipClick}
            className="flex-1 gap-2 text-base"
          >
            <AlertCircle className="h-4 w-4" />
            Skipped
          </Button>
        </div>

        {/* Context */}
        <p className="text-xs text-muted-foreground italic pt-2 border-t border-primary/10">
          💡 Track your decisions to build a win-rate history and improve future selections.
        </p>
      </CardContent>
    </Card>
  );
}
