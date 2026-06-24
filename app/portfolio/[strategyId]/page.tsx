import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import { ChevronLeft, RefreshCw, Pencil } from "lucide-react";
import { HoldingsTable } from "@/components/portfolio/HoldingsTable";
import { RebalanceSummary } from "@/components/portfolio/RebalanceSummary";
import {
  getStrategyById,
  getHoldingsByStrategyId,
} from "@/lib/portfolio/portfolio-queries";
import { fetchLivePrices } from "@/lib/portfolio/portfolio-prices";
import { computeRebalance } from "@/lib/portfolio/rebalance";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const RISK_BADGE: Record<string, { label: string; className: string }> = {
  aggressive:   { label: "HIGH RISK",   className: "bg-red-500/15 text-red-400 border-red-500/30" },
  balanced:     { label: "MEDIUM RISK", className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  conservative: { label: "LOW RISK",    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
};

export default async function StrategyDetailPage({
  params,
}: {
  params: Promise<{ strategyId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { strategyId } = await params;
  const strategy = await getStrategyById(strategyId, session.user.id);
  if (!strategy) notFound();

  const holdings = await getHoldingsByStrategyId(strategyId);
  const tickers = holdings.map((h) => h.ticker);
  const prices = tickers.length > 0 ? await fetchLivePrices(tickers) : {};
  const detail = computeRebalance(strategy, holdings, prices);

  const badge = RISK_BADGE[strategy.riskTier] ?? RISK_BADGE.balanced;
  const isPos = detail.totalReturnPct >= 0;
  const currentMultiple =
    detail.totalCostBasis > 0 ? detail.totalValue / detail.totalCostBasis : 1;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Breadcrumb */}
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          My Portfolio
        </Link>

        {/* Strategy header */}
        <div className="rounded-xl border border-primary/10 bg-card/60 p-6 backdrop-blur">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            {/* Title */}
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-3xl">{strategy.emoji}</span>
                <h1 className="text-2xl font-bold font-serif">{strategy.name}</h1>
                <span className={cn("text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border", badge.className)}>
                  {badge.label}
                </span>
              </div>
              {strategy.description && (
                <p className="text-sm text-muted-foreground mt-2">{strategy.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {holdings.length} holdings · {strategy.targetHorizonYears}yr horizon · target {strategy.targetMultiple}x
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <RefreshCw className="h-3 w-3" />
                Live prices
              </div>
              <Link
                href={`/portfolio/${strategyId}/edit`}
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium border border-primary/20 rounded-lg px-2.5 py-1 bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <Pencil className="h-3 w-3" />
                Edit Holdings
              </Link>
            </div>
          </div>

          {/* Headline metrics */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatBox label="Invested"      value={`$${detail.totalCostBasis.toLocaleString("en-US", { maximumFractionDigits: 0 })}`} />
            <StatBox label="Current Value" value={`$${detail.totalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}`} />
            <StatBox
              label="Total Return"
              value={`${isPos ? "+" : ""}${detail.totalReturnPct.toFixed(2)}%`}
              className={isPos ? "text-emerald-400" : "text-red-400"}
            />
            <StatBox
              label="Multiple"
              value={`${currentMultiple.toFixed(2)}x / ${strategy.targetMultiple}x`}
              className="text-primary"
            />
          </div>
        </div>

        {/* Holdings table */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-1">Holdings</h2>
          {holdings.length > 0 ? (
            <HoldingsTable holdings={detail.holdings} actions={detail.actions} />
          ) : (
            <div className="rounded-xl border border-dashed border-primary/20 p-10 text-center text-muted-foreground text-sm">
              No holdings yet — add your first buy via the API or holdings editor.
            </div>
          )}
        </div>

        {/* Rebalance summary */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-1">
            Quarterly Rebalance
          </h2>
          <RebalanceSummary actions={detail.actions} needsRebalance={detail.needsRebalance} />
        </div>

        {/* Blood rule reminder */}
        <div className="rounded-xl border border-primary/5 bg-primary/3 px-5 py-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-primary font-semibold">Blood rule:</span>{" "}
            Portfolio down 30–40%? Rebalance INTO the leverage sleeve using gold.
            Down 50–60%? Hold and keep rebalancing on schedule.
            <span className="font-medium text-foreground"> Never sell leverage at the bottom.</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="rounded-lg bg-background/50 px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">{label}</p>
      <p className={cn("text-sm font-bold font-mono", className)}>{value}</p>
    </div>
  );
}
