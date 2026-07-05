"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RebalanceAction } from "@/lib/portfolio/types";

interface RebalanceSummaryProps {
  actions: RebalanceAction[];
  needsRebalance: boolean;
}

export function RebalanceSummary({ actions, needsRebalance }: RebalanceSummaryProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  const buys  = actions.filter((a) => a.action === "buy");
  const trims = actions.filter((a) => a.action === "trim");
  const holds = actions.filter((a) => a.action === "hold");

  if (!needsRebalance || acknowledged) {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <div>
            <p className="font-semibold text-emerald-400">Portfolio Balanced</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              All holdings are within 5% of their target weights. Review again at your next quarterly check.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
        <p className="font-semibold text-amber-400">Rebalance Needed</p>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {trims.map((a) => (
          <ActionRow key={a.ticker} action={a} />
        ))}
        {buys.map((a) => (
          <ActionRow key={a.ticker} action={a} />
        ))}
        {holds.map((a) => (
          <ActionRow key={a.ticker} action={a} />
        ))}
      </div>

      {/* Mark as done */}
      <div className="pt-2 border-t border-amber-500/20">
        <p className="text-xs text-muted-foreground mb-3">
          Execute these trades in IBKR, then mark complete to reset the tracker for the next quarter.
        </p>
        <Button
          onClick={() => setAcknowledged(true)}
          size="sm"
          className="bg-primary/90 hover:bg-primary text-primary-foreground"
        >
          ✓ Mark as Rebalanced
        </Button>
      </div>
    </div>
  );
}

function ActionRow({ action }: { action: RebalanceAction }) {
  const styles = {
    buy:  { dot: "bg-blue-400",  text: "text-blue-400",  label: "BUY" },
    trim: { dot: "bg-amber-400", text: "text-amber-400", label: "TRIM" },
    hold: { dot: "bg-muted",     text: "text-muted-foreground", label: "HOLD" },
  }[action.action];

  return (
    <div className={cn("flex items-center justify-between rounded-lg bg-background/40 px-3 py-2")}>
      <div className="flex items-center gap-2.5">
        <span className={cn("h-2 w-2 rounded-full shrink-0", styles.dot)} />
        <span className="font-mono font-medium text-sm">{action.ticker}</span>
        <span className="text-xs text-muted-foreground">{action.name}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {action.action !== "hold" && (
          <span className="text-xs text-muted-foreground font-mono">
            ~{action.units.toFixed(2)} shares
          </span>
        )}
        <span className={cn("text-sm font-bold font-mono", styles.text)}>
          {action.action !== "hold"
            ? `${styles.label} $${action.amountUsd.toFixed(0)}`
            : "HOLD"}
        </span>
      </div>
    </div>
  );
}
