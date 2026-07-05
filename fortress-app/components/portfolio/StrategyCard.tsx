"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StrategyCardProps {
  id: string;
  name: string;
  emoji: string;
  description: string | null;
  riskTier: string;
  totalCapitalUsd: number;
  targetMultiple: number;
  targetHorizonYears: number;
  totalValue: number;
  totalCostBasis: number;
  totalReturnPct: number;
  needsRebalance: boolean;
  holdingCount: number;
}

const RISK_BADGE: Record<string, { label: string; className: string }> = {
  aggressive: { label: "HIGH RISK",    className: "bg-red-500/15 text-red-400 border-red-500/30" },
  balanced:   { label: "MEDIUM RISK",  className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  conservative:{ label: "LOW RISK",   className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
};

export function StrategyCard({
  id, name, emoji, description, riskTier,
  totalCapitalUsd, targetMultiple, targetHorizonYears,
  totalValue, totalCostBasis, totalReturnPct,
  needsRebalance, holdingCount,
}: StrategyCardProps) {
  const badge = RISK_BADGE[riskTier] ?? RISK_BADGE.balanced;
  const isPositive = totalReturnPct >= 0;
  const currentMultiple = totalCostBasis > 0 ? totalValue / totalCostBasis : 1;
  const progressPct = Math.min((currentMultiple / targetMultiple) * 100, 100);

  return (
    <Link
      href={`/portfolio/${id}`}
      className={cn(
        "group relative flex flex-col gap-4 rounded-xl border bg-card/60 p-5 backdrop-blur",
        "border-primary/10 hover:border-primary/40 hover:bg-card/80",
        "transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{emoji}</span>
          <div>
            <h3 className="font-semibold text-foreground leading-tight">{name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {holdingCount} holdings · {targetHorizonYears}yr horizon
            </p>
          </div>
        </div>
        <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border", badge.className)}>
          {badge.label}
        </span>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-2">
        <Metric label="Invested" value={`$${totalCostBasis.toLocaleString("en-US", { maximumFractionDigits: 0 })}`} />
        <Metric label="Value Now" value={`$${totalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}`} />
        <Metric
          label="Return"
          value={`${isPositive ? "+" : ""}${totalReturnPct.toFixed(1)}%`}
          className={isPositive ? "text-emerald-400" : "text-red-400"}
          icon={isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        />
      </div>

      {/* Target progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>Progress toward {targetMultiple}x target</span>
          <span className="font-mono">{currentMultiple.toFixed(2)}x</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-primary/10">
          <div
            className="h-1.5 rounded-full bg-primary/70 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {needsRebalance ? (
          <span className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
            <AlertTriangle className="h-3.5 w-3.5" />
            Rebalance due
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            On track
          </span>
        )}
        <span className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
          View details <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}

function Metric({
  label, value, className, icon,
}: {
  label: string;
  value: string;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-background/50 px-3 py-2">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
      <p className={cn("text-sm font-semibold font-mono flex items-center gap-1", className)}>
        {icon}{value}
      </p>
    </div>
  );
}
