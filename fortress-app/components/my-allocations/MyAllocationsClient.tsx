"use client";

import { useCallback, useEffect, useState } from "react";
import { AllocationHistoryTable } from "./AllocationHistoryTable";
import type { SavedAllocation, SortKey } from "@/lib/my-allocations/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MyAllocationsClientProps {
  initialAllocations: SavedAllocation[];
}

export function MyAllocationsClient({ initialAllocations }: MyAllocationsClientProps) {
  const [allocations, setAllocations] = useState<SavedAllocation[]>(initialAllocations);
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [horizonFilter, setHorizonFilter] = useState<string>("all");
  const [experienceFilter, setExperienceFilter] = useState<string>("all");

  const fetchAllocations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sort: sortKey,
        ...(horizonFilter !== "all" && { horizon: horizonFilter }),
        ...(experienceFilter !== "all" && { experience: experienceFilter }),
      });

      const response = await fetch(`/api/allocations?${params}`);
      const data = await response.json();

      if (data.success) {
        setAllocations(data.data);
      }
    } catch (error) {
      console.error("Error fetching allocations:", error);
    } finally {
      setLoading(false);
    }
  }, [sortKey, horizonFilter, experienceFilter]);

  useEffect(() => {
    fetchAllocations();
  }, [fetchAllocations]);

  const handleSortChange = (newSort: SortKey) => {
    setSortKey(newSort);
  };

  const handleHorizonFilterChange = (horizon: string) => {
    setHorizonFilter(horizon);
  };

  const handleExperienceFilterChange = (experience: string) => {
    setExperienceFilter(experience);
  };

  const clearFilters = () => {
    setSortKey("date");
    setHorizonFilter("all");
    setExperienceFilter("all");
  };

  const horizonOptions = ["short", "medium", "long", "retirement"] as const;
  const experienceOptions = ["beginner", "intermediate", "experienced"] as const;

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          {/* Sort Controls */}
          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">
              Sort By
            </label>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={sortKey === "date" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSortChange("date")}
                className="text-xs"
              >
                Date
              </Button>
              <Button
                variant={sortKey === "amount" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSortChange("amount")}
                className="text-xs"
              >
                Amount
              </Button>
              <Button
                variant={sortKey === "horizon" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSortChange("horizon")}
                className="text-xs"
              >
                Horizon
              </Button>
            </div>
          </div>

          {/* Horizon Filter */}
          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">
              Time Horizon
            </label>
            <div className="flex gap-2 flex-wrap">
              <Badge
                variant={horizonFilter === "all" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleHorizonFilterChange("all")}
              >
                All
              </Badge>
              {horizonOptions.map((horizon) => (
                <Badge
                  key={horizon}
                  variant={horizonFilter === horizon ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => handleHorizonFilterChange(horizon)}
                >
                  {horizon}
                </Badge>
              ))}
            </div>
          </div>

          {/* Experience Filter */}
          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">
              Experience Level
            </label>
            <div className="flex gap-2 flex-wrap">
              <Badge
                variant={experienceFilter === "all" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleExperienceFilterChange("all")}
              >
                All
              </Badge>
              {experienceOptions.map((experience) => (
                <Badge
                  key={experience}
                  variant={experienceFilter === experience ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => handleExperienceFilterChange(experience)}
                >
                  {experience}
                </Badge>
              ))}
            </div>
          </div>

          {/* Clear Filters Button */}
          {(sortKey !== "date" || horizonFilter !== "all" || experienceFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Clear All Filters
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <AllocationHistoryTable
        allocations={allocations}
        loading={loading}
        sortKey={sortKey}
        onSortChange={handleSortChange}
      />
    </div>
  );
}
