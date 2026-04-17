"use client";

import { useState } from "react";
import { UserProfile, Allocation } from "@/lib/investment-genie/contracts";
import { allocatePortfolio } from "@/lib/investment-genie/allocator";
import {
  queryScanResults,
  queryMacroSnapshot,
  queryIntelligence,
} from "@/lib/investment-genie/queries";
import { InvestmentGenieForm } from "./InvestmentGenieForm";
import AllocationResult from "./AllocationResult";

export default function InvestmentGeniePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [allocation, setAllocation] = useState<Allocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (profile: UserProfile) => {
    setUserProfile(profile);
    setAllocation(null);
    setError(null);
    setLoading(true);

    try {
      // Fetch all 3 queries in parallel
      const [scanData, macroState, signals] = await Promise.all([
        queryScanResults(["NSE"]), // India-only for MVP
        queryMacroSnapshot(),
        queryIntelligence(),
      ]);

      // Compute allocation
      const result = allocatePortfolio(profile, scanData, macroState, signals);
      setAllocation(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate allocation";
      setError(errorMessage);
      console.error("Allocation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUserProfile(null);
    setAllocation(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            💎 Investment Genie
          </h1>
          <p className="text-lg text-slate-300">
            Personalized portfolio allocation for NRI investors
          </p>
        </div>

        {/* Main content */}
        {!allocation ? (
          <div className="bg-white rounded-lg shadow-xl p-8">
            <InvestmentGenieForm onSubmit={handleFormSubmit} />
          </div>
        ) : (
          <div className="space-y-6">
            <AllocationResult
              allocation={allocation}
              profile={userProfile!}
            />
            <div className="flex justify-center">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition"
              >
                Generate New Allocation
              </button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="w-12 h-12 border-4 border-slate-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-700">
                Analyzing markets & generating allocation...
              </p>
              <p className="text-sm text-slate-500 mt-2">This takes 1-2 seconds</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-800 font-semibold mb-2">
              ⚠️ Error generating allocation
            </div>
            <p className="text-red-700 text-sm mb-4">{error}</p>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
