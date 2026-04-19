"use client";

import { useState } from "react";
import { UserProfile, Allocation } from "@/lib/investment-genie/contracts";
import { allocatePortfolio } from "@/lib/investment-genie/allocator";
import {
  queryScanResults,
  queryMacroSnapshot,
  queryIntelligence,
} from "@/lib/investment-genie/queries";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/fortress/BackButton";
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
      // Map selected countries to market codes
      const marketCodes = profile.countries.map(c =>
        c === "United States" ? "US" : "NSE"
      );
      const [scanData, macroState, signals] = await Promise.all([
        queryScanResults(marketCodes.length ? marketCodes : ["NSE"]),
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
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Compliance Disclaimer */}
        <div className="mb-8 bg-red-950/30 border border-red-500/20 rounded-xl p-4 backdrop-blur-sm">
          <div className="text-red-400 font-bold mb-2 flex items-center gap-2">
            <span>⚠️</span> Important Disclaimer
          </div>
          <p className="text-red-200/80 text-sm leading-relaxed">
            <strong>This is not financial advice.</strong> Investment Genie provides analysis and suggestions for research purposes only.
            You must consult a licensed financial advisor before making any investment decisions.
            Investing in stocks carries risk of loss. Past performance does not guarantee future results. You assume full responsibility for your investment decisions.
          </p>
        </div>

        {/* Header with Back Button */}
        <div className="mb-12">
          <BackButton fallbackHref="/investment-genie" className="mb-6" />
          <div className="text-center">
            <h1 className="text-4xl font-bold font-serif text-white mb-3 tracking-tight">
              💎 Investment Genie
            </h1>
            <p className="text-lg text-muted-foreground font-light">
              Personalized portfolio allocation for NRI investors
            </p>
          </div>
        </div>

        {/* Main content */}
        {!allocation ? (
          <div className="bg-card/50 backdrop-blur-md border border-white/5 rounded-2xl shadow-2xl p-8">
            <InvestmentGenieForm onSubmit={handleFormSubmit} />
          </div>
        ) : (
          <div className="space-y-6">
            <AllocationResult
              allocation={allocation}
              profile={userProfile!}
            />
            <div className="flex justify-center">
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
                className="px-8 border-white/10 hover:bg-white/5"
              >
                Generate New Allocation
              </Button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card border border-white/10 rounded-2xl p-10 text-center shadow-2xl">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6" />
              <p className="text-xl font-bold text-white mb-2">
                Analyzing Market Pulse...
              </p>
              <p className="text-muted-foreground">Triangulating signals & generating allocation</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-6 mb-8">
            <div className="text-red-400 font-bold mb-2 flex items-center gap-2">
              <span>⚠️</span> Error generating allocation
            </div>
            <p className="text-red-200/70 text-sm mb-6">{error}</p>
            <Button
              onClick={handleReset}
              variant="destructive"
              className="font-bold"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
