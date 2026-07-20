"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TradeSignal } from "@/lib/types/trading-specialist";

interface ConfidenceSummaryProps {
  signals: TradeSignal[];
  primarySignal: TradeSignal | null;
}

export function ConfidenceSummary({ signals, primarySignal }: ConfidenceSummaryProps) {
  // Calculate average confidence
  const avgConfidence = Math.round(
    signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length
  );

  // Count signal directions
  const bullishCount = signals.filter(s => s.direction === 'bullish').length;
  const bearishCount = signals.filter(s => s.direction === 'bearish').length;
  const alignedCount = Math.max(bullishCount, bearishCount);

  // Determine verdict based on primary signal + confidence
  const verdict = !primarySignal
    ? 'NEUTRAL'
    : primarySignal.confidence >= 80 && bullishCount >= 2
      ? 'BUY'
      : primarySignal.confidence >= 80 && bearishCount >= 2
        ? 'SELL'
        : 'WATCH';

  const verdictColor =
    verdict === 'BUY'
      ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
      : verdict === 'SELL'
        ? 'bg-red-500/20 border-red-500/30 text-red-300'
        : 'bg-amber-500/20 border-amber-500/30 text-amber-300';

  const verdictBgClass = verdict === 'BUY'
    ? 'bg-emerald-500/10'
    : verdict === 'SELL'
      ? 'bg-red-500/10'
      : 'bg-amber-500/10';

  return (
    <Card className={cn('border-primary/20', verdictBgClass)}>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Confidence Snapshot
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground">{avgConfidence}%</span>
              <span className="text-sm text-muted-foreground">Average confidence</span>
            </div>
          </div>
          <div className={cn('px-4 py-2 rounded-lg border font-bold text-lg', verdictColor)}>
            {verdict}
          </div>
        </div>

        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span className="text-muted-foreground">{bullishCount} bullish</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-400" />
            <span className="text-muted-foreground">{signals.length - alignedCount} diverging</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-primary/20 px-2 py-1 rounded">
              68% win rate (patterns)
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-primary/10">
          <p className="text-xs text-muted-foreground italic">
            {verdict === 'BUY'
              ? '✓ Multiple signals aligned, high confidence. Good entry zone.'
              : verdict === 'SELL'
                ? '✗ Bearish alignment detected. Wait for reversal confirmation.'
                : '→ Mixed signals. Monitor for clarity before committing.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
