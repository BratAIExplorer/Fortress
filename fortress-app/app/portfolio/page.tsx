import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import { ChevronRight, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { StrategyCard } from "@/components/portfolio/StrategyCard";
import { SeedButton } from "@/components/portfolio/SeedButton";
import { SkillBrowser } from "@/components/portfolio/SkillBrowser";
import { getStrategiesByUserId, getHoldingsByStrategyId } from "@/lib/portfolio/portfolio-queries";
import { fetchLivePrices } from "@/lib/portfolio/portfolio-prices";
import { computeRebalance } from "@/lib/portfolio/rebalance";
import { getAllocationsByUserId } from "@/lib/my-allocations/queries";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/portfolio");

  const [strategies, allocations] = await Promise.all([
    getStrategiesByUserId(session.user.id),
    getAllocationsByUserId(session.user.id),
  ]);

  // Compute live snapshots for all strategies
  const snapshots = await Promise.all(
    strategies.map(async (strategy) => {
      const holdings = await getHoldingsByStrategyId(strategy.id);
      const tickers = holdings.map((h) => h.ticker);
      const prices = tickers.length > 0 ? await fetchLivePrices(tickers) : {};
      const detail = computeRebalance(strategy, holdings, prices);
      return { strategy, detail, holdingCount: holdings.length };
    })
  );

  // Aggregate totals across all strategies
  const totalInvested = snapshots.reduce((sum, s) => sum + s.detail.totalCostBasis, 0);
  const totalValue    = snapshots.reduce((sum, s) => sum + s.detail.totalValue, 0);
  const rebalanceCount = snapshots.filter((s) => s.detail.needsRebalance).length;
  const overallReturnPct = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;
  const isPos = overallReturnPct >= 0;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold font-serif tracking-tight">My Portfolio</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Strategy tracker · Live prices · Quarterly rebalancing
            </p>
          </div>
          <Link
            href="/portfolio/rebalance-schedule"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors border border-primary/15 rounded-lg px-3 py-1.5 bg-card/40 hover:bg-card/70 shrink-0"
          >
            <ChevronRight className="h-3 w-3" />
            Rebalance Schedule
          </Link>
        </div>

        {/* ── Strategy Tracker ──────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Strategies
            </h2>
            {strategies.length > 0 && (
              <Link
                href="/api/portfolio/seed"
                className="text-xs text-primary hover:underline"
              >
                + New strategy
              </Link>
            )}
          </div>

          {/* Summary bar */}
          {strategies.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SummaryBox label="Total Invested"  value={`$${totalInvested.toLocaleString("en-US", { maximumFractionDigits: 0 })}`} />
              <SummaryBox label="Current Value"   value={`$${totalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}`} />
              <SummaryBox
                label="Overall Return"
                value={`${isPos ? "+" : ""}${overallReturnPct.toFixed(2)}%`}
                className={isPos ? "text-emerald-400" : "text-red-400"}
                icon={isPos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              />
              <SummaryBox
                label="Needs Rebalance"
                value={rebalanceCount === 0 ? "All balanced" : `${rebalanceCount} strateg${rebalanceCount === 1 ? "y" : "ies"}`}
                className={rebalanceCount > 0 ? "text-amber-400" : "text-emerald-400"}
                icon={rebalanceCount > 0 ? <AlertTriangle className="h-3 w-3" /> : undefined}
              />
            </div>
          )}

          {/* Cards grid */}
          {snapshots.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {snapshots.map(({ strategy, detail, holdingCount }) => (
                <StrategyCard
                  key={strategy.id}
                  id={strategy.id}
                  name={strategy.name}
                  emoji={strategy.emoji}
                  description={strategy.description}
                  riskTier={strategy.riskTier}
                  totalCapitalUsd={strategy.totalCapitalUsd}
                  targetMultiple={strategy.targetMultiple}
                  targetHorizonYears={strategy.targetHorizonYears}
                  totalValue={detail.totalValue}
                  totalCostBasis={detail.totalCostBasis}
                  totalReturnPct={detail.totalReturnPct}
                  needsRebalance={detail.needsRebalance}
                  holdingCount={holdingCount}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-primary/20 p-12 text-center space-y-4">
              <p className="text-2xl">🚀</p>
              <p className="font-semibold text-foreground">No strategies yet</p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Start with the 10X Moonshot — the barbell strategy built for your IBKR account.
              </p>
              <SeedButton />
            </div>
          )}
        </section>

        {/* Divider */}
        <div className="h-px bg-border/40" />

        {/* ── Portfolio Intelligence (Skill Browser) ────────────────── */}
        <section className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Portfolio Intelligence
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              AI-powered analysis · 25+ trading skills · RSI divergences · DCF · Insider activity
            </p>
          </div>
          <SkillBrowser initialAllocations={allocations} userId={session.user.id} />
        </section>

      </div>
    </div>
  );
}

function SummaryBox({
  label, value, className, icon,
}: {
  label: string;
  value: string;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-primary/10 bg-card/60 px-4 py-3">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">{label}</p>
      <p className={cn("text-sm font-bold font-mono flex items-center gap-1.5", className)}>
        {icon}{value}
      </p>
    </div>
  );
}
