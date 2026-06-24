"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HoldingWithPrice, RebalanceAction } from "@/lib/portfolio/types";

interface HoldingsTableProps {
  holdings: HoldingWithPrice[];
  actions: RebalanceAction[];
}

export function HoldingsTable({ holdings, actions }: HoldingsTableProps) {
  const actionMap = Object.fromEntries(actions.map((a) => [a.ticker, a]));

  return (
    <div className="rounded-xl border border-primary/10 bg-card/60 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-primary/10 bg-background/40">
              <Th>Holding</Th>
              <Th>Weight</Th>
              <Th className="text-right">Price</Th>
              <Th className="text-right">Units</Th>
              <Th className="text-right">Value</Th>
              <Th className="text-right">Return</Th>
              <Th className="text-center">Action</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/5">
            {holdings.map((h) => {
              const action = actionMap[h.ticker];
              const isPos = h.returnPct >= 0;

              return (
                <tr key={h.id} className="hover:bg-primary/5 transition-colors">
                  {/* Holding name */}
                  <td className="px-4 py-3">
                    <p className="font-mono font-semibold text-foreground">{h.ticker}</p>
                    <p className="text-[11px] text-muted-foreground truncate max-w-[160px]">{h.name}</p>
                  </td>

                  {/* Weight bars */}
                  <td className="px-4 py-3 min-w-[120px]">
                    <WeightBar
                      current={h.currentWeightPct}
                      target={h.targetWeightPct}
                    />
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3 text-right font-mono text-xs">
                    ${h.currentPrice.toFixed(2)}
                  </td>

                  {/* Units */}
                  <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">
                    {h.unitsHeld.toFixed(3)}
                  </td>

                  {/* Value */}
                  <td className="px-4 py-3 text-right font-mono text-sm font-medium">
                    ${h.currentValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </td>

                  {/* Return */}
                  <td className={cn("px-4 py-3 text-right font-mono text-sm font-medium flex items-center justify-end gap-1 mt-3",
                    isPos ? "text-emerald-400" : "text-red-400")}>
                    {isPos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {isPos ? "+" : ""}{h.returnPct.toFixed(1)}%
                  </td>

                  {/* Action badge */}
                  <td className="px-4 py-3 text-center">
                    <ActionBadge action={action} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WeightBar({ current, target }: { current: number; target: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{current.toFixed(1)}%</span>
        <span className="text-primary/60">{target.toFixed(0)}% target</span>
      </div>
      <div className="relative h-1.5 w-full rounded-full bg-primary/10">
        {/* Target marker */}
        <div
          className="absolute top-0 h-1.5 w-0.5 bg-primary/40 rounded-full"
          style={{ left: `${Math.min(target, 100)}%` }}
        />
        {/* Current bar */}
        <div
          className={cn(
            "h-1.5 rounded-full transition-all",
            Math.abs(current - target) >= 5 ? "bg-amber-400" : "bg-primary/70"
          )}
          style={{ width: `${Math.min(current, 100)}%` }}
        />
      </div>
    </div>
  );
}

function ActionBadge({ action }: { action: RebalanceAction | undefined }) {
  if (!action || action.action === "hold") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <Minus className="h-3 w-3" /> Hold
      </span>
    );
  }

  if (action.action === "buy") {
    return (
      <span className="inline-flex flex-col items-center rounded-lg px-2.5 py-1 text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 min-w-[80px]">
        <span>🔵 Buy</span>
        <span className="font-mono font-bold">${action.amountUsd.toFixed(0)}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col items-center rounded-lg px-2.5 py-1 text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 min-w-[80px]">
      <span>✂️ Trim</span>
      <span className="font-mono font-bold">${action.amountUsd.toFixed(0)}</span>
    </span>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn("px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", className)}>
      {children}
    </th>
  );
}
