"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StrategyHolding } from "@/lib/portfolio/types";

interface HoldingRow {
  id: string;
  ticker: string;
  name: string;
  targetWeightPct: number;
  unitsHeld: string;   // keep as string for input control
  avgBuyPrice: string; // keep as string for input control
}

interface HoldingsEditorProps {
  strategyId: string;
  holdings: StrategyHolding[];
}

export function HoldingsEditor({ strategyId, holdings }: HoldingsEditorProps) {
  const router = useRouter();
  const [rows, setRows] = useState<HoldingRow[]>(
    holdings.map((h) => ({
      id: h.id,
      ticker: h.ticker,
      name: h.name,
      targetWeightPct: h.targetWeightPct,
      unitsHeld: h.unitsHeld > 0 ? String(h.unitsHeld) : "",
      avgBuyPrice: h.avgBuyPrice > 0 ? String(h.avgBuyPrice) : "",
    }))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateRow(index: number, field: "unitsHeld" | "avgBuyPrice", value: string) {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    const payload = rows.map((r) => ({
      ticker: r.ticker,
      name: r.name,
      targetWeightPct: r.targetWeightPct,
      unitsHeld: parseFloat(r.unitsHeld) || 0,
      avgBuyPrice: parseFloat(r.avgBuyPrice) || 0,
    }));

    try {
      const res = await fetch(`/api/portfolio/${strategyId}/holdings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdings: payload }),
      });
      const json = await res.json() as { success: boolean; error?: string };
      if (!json.success) throw new Error(json.error ?? "Save failed");
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save holdings");
    } finally {
      setSaving(false);
    }
  }

  const totalWeight = rows.reduce((sum, r) => sum + r.targetWeightPct, 0);
  const hasEntries = rows.some((r) => parseFloat(r.unitsHeld) > 0);

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-xl border border-primary/10 bg-card/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-primary/10 bg-background/40">
                <Th>Holding</Th>
                <Th className="text-right">Target Weight</Th>
                <Th className="text-right">Units Held</Th>
                <Th className="text-right">Avg Buy Price (USD)</Th>
                <Th className="text-right">Est. Cost Basis</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {rows.map((row, i) => {
                const units = parseFloat(row.unitsHeld) || 0;
                const price = parseFloat(row.avgBuyPrice) || 0;
                const costBasis = units * price;

                return (
                  <tr key={row.id} className="hover:bg-primary/5 transition-colors">
                    {/* Ticker */}
                    <td className="px-4 py-3">
                      <p className="font-mono font-semibold">{row.ticker}</p>
                      <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">{row.name}</p>
                    </td>

                    {/* Target weight */}
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono text-xs text-muted-foreground">{row.targetWeightPct}%</span>
                    </td>

                    {/* Units input */}
                    <td className="px-4 py-3 text-right">
                      <input
                        type="number"
                        min="0"
                        step="0.001"
                        placeholder="0.000"
                        value={row.unitsHeld}
                        onChange={(e) => updateRow(i, "unitsHeld", e.target.value)}
                        className={cn(
                          "w-28 rounded-md border border-primary/20 bg-background/60 px-2 py-1",
                          "text-right font-mono text-xs text-foreground",
                          "focus:outline-none focus:ring-1 focus:ring-primary/50",
                          "placeholder:text-muted-foreground/40"
                        )}
                      />
                    </td>

                    {/* Avg price input */}
                    <td className="px-4 py-3 text-right">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={row.avgBuyPrice}
                        onChange={(e) => updateRow(i, "avgBuyPrice", e.target.value)}
                        className={cn(
                          "w-28 rounded-md border border-primary/20 bg-background/60 px-2 py-1",
                          "text-right font-mono text-xs text-foreground",
                          "focus:outline-none focus:ring-1 focus:ring-primary/50",
                          "placeholder:text-muted-foreground/40"
                        )}
                      />
                    </td>

                    {/* Computed cost basis */}
                    <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">
                      {costBasis > 0
                        ? `$${costBasis.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-xs text-muted-foreground">
          Target weights sum:{" "}
          <span className={cn("font-mono font-semibold", Math.abs(totalWeight - 100) <= 1 ? "text-emerald-400" : "text-amber-400")}>
            {totalWeight.toFixed(1)}%
          </span>
          {" "}· Enter your shares from IBKR and the average price paid.
        </p>

        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Saved
            </span>
          )}
          {error && <span className="text-xs text-red-400">{error}</span>}
          <Button
            onClick={handleSave}
            disabled={saving || !hasEntries}
            size="sm"
            className="gap-2 bg-primary/90 hover:bg-primary text-primary-foreground"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {saving ? "Saving…" : "Save Holdings"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn("px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", className)}>
      {children}
    </th>
  );
}
