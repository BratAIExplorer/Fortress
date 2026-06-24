"use client";

import { Briefcase, ChevronUp, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SavedAllocation, SortKey } from "@/lib/my-allocations/types";

interface AllocationHistoryTableProps {
  allocations: SavedAllocation[];
  loading: boolean;
  sortKey: SortKey;
  onSortChange: (key: SortKey) => void;
}

export function AllocationHistoryTable({
  allocations,
  loading,
  sortKey,
  onSortChange,
}: AllocationHistoryTableProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const horizonColors: Record<string, string> = {
    short: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    long: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    retirement: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  };

  const experienceColors: Record<string, string> = {
    beginner: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    intermediate: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    experienced: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  };

  const SortHeader = ({
    label,
    sortKeyValue,
  }: {
    label: string;
    sortKeyValue: SortKey;
  }) => (
    <button
      onClick={() => onSortChange(sortKeyValue)}
      className="flex items-center gap-1 hover:text-white transition-colors"
    >
      {label}
      {sortKey === sortKeyValue ? (
        <ChevronDown className="h-4 w-4" />
      ) : (
        <ChevronUp className="h-3 w-3 opacity-50" />
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border border-primary/30 border-t-primary"></div>
      </div>
    );
  }

  if (allocations.length === 0) {
    return (
      <div className="py-16 text-center border border-dashed border-white/10 rounded-xl">
        <Briefcase className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <h4 className="text-slate-300 font-medium text-lg">No allocations yet</h4>
        <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
          Generate and save your first portfolio allocation in Investment Genie to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/5">
            <th className="text-left px-4 py-4 font-semibold text-slate-300">
              <SortHeader label="Date Saved" sortKeyValue="date" />
            </th>
            <th className="text-left px-4 py-4 font-semibold text-slate-300">
              <SortHeader label="Amount" sortKeyValue="amount" />
            </th>
            <th className="text-left px-4 py-4 font-semibold text-slate-300">
              Risk Appetite
            </th>
            <th className="text-left px-4 py-4 font-semibold text-slate-300">
              <SortHeader label="Horizon" sortKeyValue="horizon" />
            </th>
            <th className="text-left px-4 py-4 font-semibold text-slate-300">
              Experience
            </th>
            <th className="text-left px-4 py-4 font-semibold text-slate-300">
              Markets
            </th>
          </tr>
        </thead>
        <tbody>
          {allocations.map((allocation, index) => (
            <tr
              key={allocation.id}
              className={cn(
                "border-b border-white/5 hover:bg-white/5 transition-colors",
                index % 2 === 0 ? "" : "bg-white/[0.02]"
              )}
            >
              <td className="px-4 py-4 text-slate-200">
                {formatDate(allocation.createdAt)}
              </td>
              <td className="px-4 py-4 font-semibold text-emerald-400">
                {formatAmount(allocation.amount)}
              </td>
              <td className="px-4 py-4 text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-emerald-500"
                      style={{
                        width: `${parseFloat(allocation.riskAppetite)}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-400">
                    {Math.round(parseFloat(allocation.riskAppetite))}%
                  </span>
                </div>
              </td>
              <td className="px-4 py-4">
                <Badge
                  className={cn(
                    "capitalize border text-xs font-medium",
                    horizonColors[allocation.horizon] || "bg-slate-500/20 text-slate-300"
                  )}
                >
                  {allocation.horizon}
                </Badge>
              </td>
              <td className="px-4 py-4">
                <Badge
                  className={cn(
                    "capitalize border text-xs font-medium",
                    experienceColors[allocation.experience] || "bg-slate-500/20 text-slate-300"
                  )}
                >
                  {allocation.experience}
                </Badge>
              </td>
              <td className="px-4 py-4 text-slate-300">
                <span className="text-xs">
                  {allocation.countries.join(", ")}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
