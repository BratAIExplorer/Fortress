"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { IntelligenceReport, ImpactDirection, EnvironmentLevel } from "@/lib/intelligence/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function impactColor(impact: ImpactDirection): string {
  switch (impact) {
    case "positive": return "text-emerald-400";
    case "negative": return "text-red-400";
    case "mixed":    return "text-amber-400";
    default:         return "text-slate-400";
  }
}

function impactBg(impact: ImpactDirection): string {
  switch (impact) {
    case "positive": return "bg-emerald-500/10 border-emerald-500/20";
    case "negative": return "bg-red-500/10 border-red-500/20";
    case "mixed":    return "bg-amber-500/10 border-amber-500/20";
    default:         return "bg-white/5 border-white/10";
  }
}

function impactLabel(impact: ImpactDirection): string {
  switch (impact) {
    case "positive": return "↑ Tailwind";
    case "negative": return "↓ Headwind";
    case "mixed":    return "⇄ Mixed";
    default:         return "→ Neutral";
  }
}

function envDot(level: EnvironmentLevel): string {
  switch (level) {
    case "positive": return "bg-emerald-400";
    case "negative": return "bg-red-400";
    default:         return "bg-slate-400";
  }
}

function envText(level: EnvironmentLevel): string {
  switch (level) {
    case "positive": return "text-emerald-400";
    case "negative": return "text-red-400";
    default:         return "text-slate-400";
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EnvironmentBar({ factors }: { factors: IntelligenceReport["environment"] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {factors.map((f) => (
        <div key={f.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn("w-2 h-2 rounded-full shrink-0", envDot(f.level))} />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              {f.label}
            </span>
          </div>
          <p className={cn("text-sm font-bold", envText(f.level))}>{f.state}</p>
          <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{f.note}</p>
        </div>
      ))}
    </div>
  );
}

function SignalCard({ signal }: { signal: IntelligenceReport["signals"][0] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{signal.emoji}</span>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {signal.label}
          </span>
        </div>
        <span className="font-mono text-sm font-bold text-white">{signal.formattedValue}</span>
      </div>
      <p className="text-sm font-medium text-white leading-snug">{signal.headline}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{signal.explanation}</p>
    </div>
  );
}

function SectorGrid({ sectors }: { sectors: IntelligenceReport["sectorImpacts"] }) {
  const india = sectors.filter(s => s.market === "India");
  const us = sectors.filter(s => s.market === "US");

  return (
    <div className="space-y-6">
      <SectorGroup title="India Sectors" sectors={india} />
      <SectorGroup title="US Sectors" sectors={us} />
    </div>
  );
}

function SectorGroup({ title, sectors }: { title: string; sectors: IntelligenceReport["sectorImpacts"] }) {
  if (sectors.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sectors.map((s) => (
          <div key={s.sector} className={cn("rounded-xl border p-4 space-y-2", impactBg(s.impact))}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base">{s.emoji}</span>
                <span className="text-xs font-semibold text-white">{s.sector}</span>
              </div>
              <span className={cn("text-[10px] font-bold shrink-0", impactColor(s.impact))}>
                {impactLabel(s.impact)}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{s.clarityText}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ClarityPanelProps {
  className?: string;
}

export function ClarityPanel({ className }: ClarityPanelProps) {
  const [report, setReport] = useState<IntelligenceReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/intelligence/latest")
      .then(r => r.json())
      .then(d => setReport(d.report ?? null))
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={cn("rounded-2xl border border-white/10 bg-white/5 p-8 flex items-center justify-center", className)}>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          Loading clarity report...
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className={cn("rounded-2xl border border-white/10 bg-white/5 p-8 text-center space-y-2", className)}>
        <p className="text-2xl">🔍</p>
        <p className="text-sm font-medium text-white">No clarity report yet</p>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Generate your first intelligence report using the admin panel below after a macro snapshot is saved.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-8", className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Intelligence Layer</span>
          </div>
          <h2 className="text-2xl font-bold font-serif text-white">Market Clarity Report</h2>
          <p className="text-sm text-muted-foreground mt-1">
            What is happening, why it matters, and what each sector faces — no predictions, no advice.
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-muted-foreground">Snapshot</p>
          <p className="text-sm font-medium text-white">{formatDate(report.generatedAt ?? report.snapshotDate)}</p>
          <p className="text-[10px] text-emerald-400/70 font-medium uppercase tracking-wider mt-1">Updates Weekly</p>
        </div>
      </div>

      {/* Environment Bar */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Current Environment
        </p>
        <EnvironmentBar factors={report.environment} />
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
        <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Overview</p>
        <p className="text-sm text-white/90 leading-relaxed">{report.summary}</p>
      </div>

      {/* Signal Cards */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Signal Breakdown
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {report.signals.map(s => (
            <SignalCard key={s.signal} signal={s} />
          ))}
        </div>
      </div>

      {/* Sector Impacts */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Sector Impact
        </p>
        <SectorGrid sectors={report.sectorImpacts} />
      </div>

      {/* Clarity Disclaimer */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          This report explains current macro conditions and their historical sector correlations. It does not constitute financial advice, a buy or sell recommendation, or a prediction of future performance. All decisions remain with the investor. Past sector patterns do not guarantee future outcomes.
        </p>
      </div>
    </div>
  );
}
