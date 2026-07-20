"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Lightbulb,
  ChartLine,
  Briefcase,
  Layers,
  Search,
  Moon,
  AlertCircle,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MultiTimeframeSetupCard } from "@/components/fortress/MultiTimeframeSetupCard";
import { TradingChart } from "@/components/fortress/TradingChart";
import { WeightRecommendationsWidget } from "@/components/fortress/WeightRecommendationsWidget";
import { AssetTypeBadge } from "@/components/trading/AssetTypeBadge";
import { FundMetricsPanel } from "@/components/trading/FundMetricsPanel";
import { detectAssetType } from "@/lib/utils/detectAssetType";
import type {
  AnalysisState,
  FundamentalsResponse,
  GemScoreResponse,
  TradeSignal,
} from "@/lib/types/trading-specialist";

export function TradingSpecialist() {
  const [state, setState] = useState<AnalysisState>({
    ticker: "AAPL",
    loading: false,
    error: null,
    data: null,
  });
  const [activeTab, setActiveTab] = useState<
    "technical" | "fundamental" | "options" | "recommendations"
  >("technical");
  const [fundamentals, setFundamentals] = useState<FundamentalsResponse | null>(null);
  const [fundamentalsLoading, setFundamentalsLoading] = useState(false);
  const [assetType, setAssetType] = useState<'stock' | 'etf' | 'unknown'>('unknown');

  // Fetch GEM SCORE data
  const analyzeTicke = useCallback(async (ticker: string) => {
    if (!ticker.trim()) {
      setState((prev) => ({
        ...prev,
        error: "Enter a ticker symbol",
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      ticker,
      loading: true,
      error: null,
      data: null,
    }));

    try {
      // Detect asset type (stock vs ETF)
      const type = await detectAssetType(ticker);
      setAssetType(type);

      const res = await fetch(`/api/analysis/gem-score?ticker=${ticker}`);
      const json: GemScoreResponse = await res.json();

      if (!res.ok || !json.success) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: json.error || "Analysis failed",
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        data: json,
      }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Network error";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
    }
  }, []);

  // Load default ticker on mount
  useEffect(() => {
    analyzeTicke("AAPL");
  }, [analyzeTicke]);

  // Fetch fundamentals lazily — only when the tab is opened, per current ticker
  useEffect(() => {
    if (activeTab !== "fundamental" || !state.ticker) return;
    setFundamentalsLoading(true);
    fetch(`/api/analysis/fundamentals?ticker=${state.ticker}`)
      .then((res) => res.json())
      .then((json: FundamentalsResponse) => setFundamentals(json))
      .catch(() => setFundamentals(null))
      .finally(() => setFundamentalsLoading(false));
  }, [activeTab, state.ticker]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const input = e.currentTarget.value;
      analyzeTicke(input);
    }
  };

  const handleSearchClick = () => {
    const input = document.querySelector(
      "input[placeholder*='ticker']"
    ) as HTMLInputElement;
    if (input?.value) {
      analyzeTicke(input.value);
    }
  };

  const logTrade = async (action: "BOUGHT" | "SKIPPED") => {
    if (!state.data?.signals[0]) return;

    const confidence = Math.max(
      ...state.data.signals.map((s) => s.confidence)
    );

    try {
      const res = await fetch("/api/analysis/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: state.ticker,
          gemScore: confidence,
          action,
        }),
      });

      if (res.ok) {
        // Simple confirmation toast
        const event = new CustomEvent("trade-logged", {
          detail: { ticker: state.ticker, action },
        });
        window.dispatchEvent(event);
      }
    } catch (err) {
      console.error("Failed to log trade:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar + Asset Type Badge */}
      <div className="flex gap-3 items-center">
        <div className="flex-1 flex gap-2 items-center">
          <input
            type="text"
            placeholder="Enter ticker (AAPL, HDFC, etc.)"
            defaultValue="AAPL"
            onKeyDown={handleSearch}
            className="flex-1 px-4 py-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {state.data && !state.loading && (
            <AssetTypeBadge assetType={assetType} />
          )}
        </div>
        <Button
          size="sm"
          onClick={handleSearchClick}
          className="gap-2"
        >
          <Search className="h-4 w-4" />
          Analyze
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 w-10"
          title="Dark mode toggle"
        >
          <Moon className="h-4 w-4" />
        </Button>
      </div>

      {/* Error State */}
      {state.error && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Error</p>
            <p className="text-sm text-destructive/80 mt-0.5">
              {state.error}
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {state.loading && (
        <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Analyzing {state.ticker}...</span>
        </div>
      )}

      {/* Content */}
      {state.data && !state.loading && (
        <>
          {/* Strategy Signals Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {state.data.signals.map((signal) => (
              <SignalCard key={signal.timeframe} signal={signal} />
            ))}
          </div>

          {/* Bottom Line */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Lightbulb className="h-4 w-4 text-primary" />
                The Bottom Line
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium text-sm">
                {state.data.bottomLine.headline}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {state.data.bottomLine.body}
              </p>
            </CardContent>
          </Card>

          {/* Log Trade */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary" />
                Log This Trade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Track your decisions and build a win-rate history
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => logTrade("BOUGHT")}
                  className="flex-1 gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  Bought
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => logTrade("SKIPPED")}
                  className="flex-1 gap-2"
                >
                  <AlertCircle className="h-4 w-4" />
                  Skipped
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <div className="flex gap-0 border-b border-border">
            {[
              {
                id: "technical",
                label: "Technical Analysis",
                icon: ChartLine,
              },
              { id: "fundamental", label: "Fundamental Core", icon: Briefcase },
              {
                id: "options",
                label: "Multi-Asset Options",
                icon: Layers,
              },
              {
                id: "recommendations",
                label: "Weight Recommendations",
                icon: BarChart3,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(tab.id as typeof activeTab)
                  }
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                    activeTab === tab.id
                      ? "border-b-primary text-primary"
                      : "border-b-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          {activeTab === "technical" && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ChartLine className="h-4 w-4 text-primary" />
                    Price Action & Moving Averages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {state.data.chartData && state.data.chartData.length > 0 ? (
                    <TradingChart data={state.data.chartData} />
                  ) : (
                    <div className="p-12 flex flex-col items-center justify-center gap-3 min-h-80">
                      <ChartLine className="h-12 w-12 text-muted-foreground/30" />
                      <p className="text-muted-foreground text-center text-sm">
                        No chart data available
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ETF-Specific Metrics (conditional) */}
              {assetType === 'etf' && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      Fund Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FundMetricsPanel ticker={state.ticker} />
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === "fundamental" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Briefcase className="h-4 w-4 text-primary" />
                  Fundamentals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {fundamentalsLoading ? (
                  <div className="p-12 flex flex-col items-center justify-center gap-3 min-h-80">
                    <RefreshCw className="h-8 w-8 text-muted-foreground/30 animate-spin" />
                  </div>
                ) : !fundamentals || !fundamentals.success ? (
                  <div className="p-12 flex flex-col items-center justify-center gap-3 min-h-80">
                    <Briefcase className="h-12 w-12 text-muted-foreground/30" />
                    <p className="text-muted-foreground text-center text-sm">
                      {fundamentals?.error || "Fundamentals not available for this ticker"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <FundamentalStat label="Trailing P/E" value={fundamentals.trailingPE?.toFixed(1)} />
                    <FundamentalStat label="Forward P/E" value={fundamentals.forwardPE?.toFixed(1)} />
                    <FundamentalStat label="Price / Book" value={fundamentals.priceToBook?.toFixed(1)} />
                    <FundamentalStat label="Profit Margin" value={formatPct(fundamentals.profitMargin)} />
                    <FundamentalStat label="Revenue Growth (YoY)" value={formatPct(fundamentals.revenueGrowth)} />
                    <FundamentalStat label="Return on Equity" value={formatPct(fundamentals.returnOnEquity)} />
                    <FundamentalStat label="Dividend Yield" value={formatPct(fundamentals.dividendYield)} />
                    <FundamentalStat label="Free Cash Flow" value={formatLarge(fundamentals.freeCashflow, fundamentals.currency)} />
                    <FundamentalStat label="Market Cap" value={formatLarge(fundamentals.marketCap, fundamentals.currency)} />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "options" && (
            <Card>
              <CardContent className="p-12 flex flex-col items-center justify-center gap-3 min-h-80">
                <Layers className="h-12 w-12 text-muted-foreground/30" />
                <p className="text-muted-foreground text-center text-sm">
                  Multi-asset options coming soon
                </p>
                <p className="text-xs text-muted-foreground">
                  Options chains, strategies, and risk analysis
                </p>
              </CardContent>
            </Card>
          )}

          {activeTab === "recommendations" && (
            <WeightRecommendationsWidget />
          )}

          {/* Multi-Timeframe Panel - Enhanced for non-technical traders */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Multi-timeframe Setup
              </p>
              <p className="text-xs text-muted-foreground italic">
                Click any card for details
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {state.data.multiTimeframe.map((item, i) => (
                <MultiTimeframeSetupCard key={i} item={item} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Signal Card ─────────────────────────────────────────────────────────────
function SignalCard({ signal }: { signal: TradeSignal }) {
  const bgColor =
    signal.direction === "bullish"
      ? "bg-green-500/10 border-green-500/20"
      : signal.direction === "bearish"
        ? "bg-red-500/10 border-red-500/20"
        : "bg-amber-500/10 border-amber-500/20";

  const badgeColor =
    signal.direction === "bullish"
      ? "bg-green-500/20 text-green-300 border-green-500/30"
      : signal.direction === "bearish"
        ? "bg-red-500/20 text-red-300 border-red-500/30"
        : "bg-amber-500/20 text-amber-300 border-amber-500/30";

  const Icon =
    signal.direction === "bullish"
      ? TrendingUp
      : signal.direction === "bearish"
        ? TrendingDown
        : Lightbulb;

  return (
    <Card className={cn("border", bgColor)}>
      <CardContent className="p-4 text-center space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          {signal.timeframe === "intraday"
            ? "Intraday"
            : signal.timeframe === "shortTerm"
              ? "Short-term (1–6M)"
              : "Long-term (1Y+)"}
        </p>
        <Icon className="h-6 w-6 mx-auto text-foreground" />
        <Badge className={cn("border", badgeColor)}>
          {signal.label}
        </Badge>
        <p className="text-xs text-muted-foreground">
          Confidence: {signal.confidence}%
        </p>
      </CardContent>
    </Card>
  );
}

function formatPct(value: number | null | undefined): string | undefined {
  return value === null || value === undefined ? undefined : `${(value * 100).toFixed(1)}%`;
}

function formatLarge(value: number | null | undefined, currency: string): string | undefined {
  if (value === null || value === undefined) return undefined;
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${currency}${(value / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${currency}${(value / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${currency}${(value / 1e6).toFixed(2)}M`;
  return `${currency}${value.toFixed(0)}`;
}

function FundamentalStat({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="rounded-xl border border-primary/10 bg-card/60 px-4 py-3">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-bold font-mono">{value ?? "—"}</p>
    </div>
  );
}
