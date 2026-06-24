import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { HoldingsEditor } from "@/components/portfolio/HoldingsEditor";
import {
  getStrategyById,
  getHoldingsByStrategyId,
} from "@/lib/portfolio/portfolio-queries";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const RISK_BADGE: Record<string, { label: string; className: string }> = {
  aggressive:   { label: "HIGH RISK",   className: "bg-red-500/15 text-red-400 border-red-500/30" },
  balanced:     { label: "MEDIUM RISK", className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  conservative: { label: "LOW RISK",    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
};

export default async function EditHoldingsPage({
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
  const badge = RISK_BADGE[strategy.riskTier] ?? RISK_BADGE.balanced;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Breadcrumb */}
        <Link
          href={`/portfolio/${strategyId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {strategy.name}
        </Link>

        {/* Header */}
        <div className="rounded-xl border border-primary/10 bg-card/60 p-5 backdrop-blur">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-3xl">{strategy.emoji}</span>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold font-serif">Edit Holdings</h1>
                <span className={cn("text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border", badge.className)}>
                  {badge.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{strategy.name}</p>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-primary/5 border border-primary/10 px-4 py-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="text-primary font-semibold">How to fill this in:</span>{" "}
              Open IBKR → Portfolio → find each ticker. Enter the number of shares you hold
              and the average price you paid (IBKR shows this as "Avg Cost"). Leave at 0 if
              you haven&apos;t bought yet.
            </p>
          </div>
        </div>

        {/* Editor */}
        {holdings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-primary/20 p-10 text-center text-muted-foreground text-sm">
            No holdings configured for this strategy. Add holdings via the API first.
          </div>
        ) : (
          <HoldingsEditor strategyId={strategyId} holdings={holdings} />
        )}

      </div>
    </div>
  );
}
