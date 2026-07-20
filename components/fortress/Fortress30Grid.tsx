"use client";

import { ScannerCandidate } from "@/lib/types";
import { ScannerCandidateCard } from "./ScannerCandidateCard";
import { RadioTower, TriangleAlert } from "lucide-react";

interface Fortress30GridProps {
  stocks: ScannerCandidate[];
  marketConfig: { label: string };
  candidates: ScannerCandidate[];
  dbError?: boolean;
}

export function Fortress30Grid({ stocks, marketConfig, candidates, dbError }: Fortress30GridProps) {
  return (
    <>
      {/* Stock Grid */}
      {dbError ? (
        <div className="py-24 text-center border border-dashed border-red-500/30 rounded-xl bg-red-950/10">
          <TriangleAlert className="h-10 w-10 text-red-400 mx-auto mb-4" />
          <h4 className="text-red-300 font-medium">
            System issue — data temporarily unavailable
          </h4>
          <p className="text-slate-500 text-xs mt-2 max-w-sm mx-auto">
            We couldn&apos;t reach the database. This isn&apos;t a missing scan —
            it&apos;s an outage. Please try again shortly.
          </p>
        </div>
      ) : stocks.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-white/10 rounded-xl">
          <RadioTower className="h-10 w-10 text-slate-600 mx-auto mb-4" />
          <h4 className="text-slate-300 font-medium">
            No {marketConfig.label} scan data yet
          </h4>
          <p className="text-slate-500 text-xs mt-2 max-w-sm mx-auto">
            The daily scanner will populate this list automatically.
            Check back after the next scheduled scan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {stocks.map((stock: ScannerCandidate) => (
            <ScannerCandidateCard key={stock.id} candidate={stock} />
          ))}
        </div>
      )}

      {/* Candidates (31-40) */}
      {candidates.length > 0 && (
        <div className="mt-20 space-y-6">
          <div className="flex items-center gap-4">
            <RadioTower className="h-4 w-4 text-amber-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
              Ranked 31–40
            </span>
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] text-muted-foreground">
              {candidates.length} stocks · just outside top 30
            </span>
          </div>
          <p className="text-xs text-muted-foreground max-w-2xl">
            Next highest-scoring stocks below the Fortress 30 cutoff.
            Watch these for potential promotion next scan.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {candidates.map((c: ScannerCandidate) => (
              <ScannerCandidateCard key={c.id} candidate={c} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
