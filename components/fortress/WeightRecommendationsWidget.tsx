"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";

interface WeightRecommendation {
  range: string;
  currentWinRate: number | null;
  adjustment: "UPWEIGHT" | "DOWNWEIGHT" | "MAINTAIN";
  adjustmentPct: number;
}

interface ScoreRangeStats {
  range: string;
  totalTrades: number;
  boughtTrades: number;
  winRate: number | null;
}

export function WeightRecommendationsWidget() {
  const [recommendations, setRecommendations] = useState<WeightRecommendation[]>([]);
  const [stats, setStats] = useState<ScoreRangeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch("/api/analysis/feedback", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch recommendations");
        const data = await res.json();
        setRecommendations(data.weightRecommendations || []);
        setStats(data.byScoreRange || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading recommendations...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground text-sm">
            No trades yet. Log some trades to see recommendations.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" />
            Weight Recommendations by GEM SCORE Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-4">
            Based on historical win rates. Green = outperforming, Red = underperforming.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendations.map((rec) => {
              const stat = stats.find((s) => s.range === rec.range);
              const bgColor =
                rec.adjustment === "UPWEIGHT"
                  ? "bg-green-500/10 border-green-500/30"
                  : rec.adjustment === "DOWNWEIGHT"
                    ? "bg-red-500/10 border-red-500/30"
                    : "bg-slate-500/10 border-slate-500/30";

              const badgeColor =
                rec.adjustment === "UPWEIGHT"
                  ? "bg-green-500/20 text-green-300 border-green-500/30"
                  : rec.adjustment === "DOWNWEIGHT"
                    ? "bg-red-500/20 text-red-300 border-red-500/30"
                    : "bg-slate-500/20 text-slate-300 border-slate-500/30";

              const Icon =
                rec.adjustment === "UPWEIGHT"
                  ? TrendingUp
                  : rec.adjustment === "DOWNWEIGHT"
                    ? TrendingDown
                    : Minus;

              return (
                <div key={rec.range} className={`border rounded-lg p-4 ${bgColor}`}>
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{rec.range}</p>
                      <Badge className={`border ${badgeColor}`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {rec.adjustment}
                      </Badge>
                    </div>

                    {/* Win Rate */}
                    <div className="text-xs text-muted-foreground">
                      {rec.currentWinRate !== null ? (
                        <>
                          Win Rate: <span className="font-semibold text-foreground">{rec.currentWinRate}%</span>
                        </>
                      ) : (
                        <span className="italic">No data yet</span>
                      )}
                    </div>

                    {/* Adjustment */}
                    <div className="text-xs text-muted-foreground">
                      Adjustment:{" "}
                      <span
                        className={`font-semibold ${
                          rec.adjustmentPct > 0
                            ? "text-green-300"
                            : rec.adjustmentPct < 0
                              ? "text-red-300"
                              : "text-slate-300"
                        }`}
                      >
                        {rec.adjustmentPct > 0 ? "+" : ""}
                        {rec.adjustmentPct}%
                      </span>
                    </div>

                    {/* Trade Count */}
                    {stat && (
                      <div className="text-xs text-muted-foreground">
                        Trades: <span className="font-semibold text-foreground">{stat.boughtTrades} bought</span> / {stat.totalTrades} total
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="mt-4 p-3 bg-muted rounded text-xs text-muted-foreground">
            💡 <strong>How to use:</strong> Increase weights for UPWEIGHT ranges. Decrease for DOWNWEIGHT ranges. Hold MAINTAIN ranges steady.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
