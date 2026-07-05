/**
 * ThesisList Component
 *
 * Grid of thesis cards showing all available theses
 * Each card displays: name, macro catalyst, conviction score, status
 *
 * Props: None (fetches data from /api/thesis)
 * Used by: /thesis page (browse all theses)
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SectorThesis } from "@/lib/types/thesis";

interface ThesisCard extends SectorThesis {
  stockCount?: number;
}

export function ThesisList() {
  const [theses, setTheses] = useState<ThesisCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTheses();
  }, []);

  async function fetchTheses() {
    try {
      const response = await fetch("/api/thesis");
      if (!response.ok) throw new Error("Failed to fetch theses");

      const data = await response.json();
      setTheses(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Loading theses...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-400">Error: {error}</div>;
  }

  if (theses.length === 0) {
    return <div className="text-center py-8 text-gray-400">No theses available</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {theses.map((thesis) => (
        <Link key={thesis.id} href={`/thesis/${thesis.slug}`}>
          <div className="group relative p-6 rounded-lg border border-gray-700 bg-gradient-to-br from-gray-900 to-gray-800 hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer h-full flex flex-col">
            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  thesis.convictionStatus === "WORKING"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : thesis.convictionStatus === "FALTERING"
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-red-500/20 text-red-300"
                }`}
              >
                {thesis.convictionStatus}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-white mb-2 pr-20 group-hover:text-blue-300 transition-colors">
              {thesis.name}
            </h3>

            {/* Macro Catalyst */}
            <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-grow">
              {thesis.macroCatalyst}
            </p>

            {/* Metrics */}
            <div className="space-y-3 border-t border-gray-700 pt-4">
              {/* Conviction Meter */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-gray-300">Conviction</span>
                  <span className="text-sm font-semibold text-blue-300">
                    {Math.round(thesis.convictionScore * 100)}/100
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-1.5 rounded-full transition-all"
                    style={{ width: `${thesis.convictionScore * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Historical CAGR */}
              {thesis.historicalCagr && (
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-300">Historical CAGR</span>
                  <span className="text-sm font-semibold text-emerald-400">
                    {thesis.historicalCagr.toFixed(1)}%
                  </span>
                </div>
              )}

              {/* Timeframe */}
              {thesis.timeframeYears && (
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-300">Timeframe</span>
                  <span className="text-sm font-medium text-gray-300">
                    {thesis.timeframeYears} years
                  </span>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <div className="mt-4 flex items-center text-blue-400 text-sm font-medium group-hover:text-blue-300 transition-colors">
              Learn More
              <svg
                className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
