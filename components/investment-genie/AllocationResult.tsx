"use client";

import { Allocation, UserProfile } from "@/lib/investment-genie/contracts";

interface AllocationResultProps {
  allocation: Allocation;
  profile: UserProfile;
}

export default function AllocationResult({
  allocation,
  profile,
}: AllocationResultProps) {
  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-4">Your Personalized Allocation</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-blue-100">Investment Amount</p>
            <p className="text-2xl font-bold">${profile.amount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-blue-100">Time Horizon</p>
            <p className="text-2xl font-bold capitalize">
              {profile.horizon === "retirement" ? "Until Retirement" : profile.horizon}
            </p>
          </div>
          <div>
            <p className="text-sm text-blue-100">Risk Appetite</p>
            <p className="text-2xl font-bold">{profile.riskAppetite}%</p>
          </div>
          <div>
            <p className="text-sm text-blue-100">Experience Level</p>
            <p className="text-2xl font-bold capitalize">{profile.experience}</p>
          </div>
        </div>
      </div>

      {/* Allocation Layers */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-4">Portfolio Layers</h3>
        <div className="space-y-4">
          {Object.values(allocation.layers).map((layer) => (
            <div
              key={layer.name}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
            >
              <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-4">
                <h4 className="text-lg font-bold text-white">{layer.name}</h4>
                <p className="text-sm text-slate-200 mt-1">{layer.why}</p>
              </div>

              <div className="p-6">
                {/* Layer vehicles */}
                <div className="space-y-3">
                  {layer.vehicles.map((vehicle) => (
                    <div
                      key={vehicle.ticker}
                      className="flex items-start gap-4 pb-3 border-b border-slate-200 last:border-0"
                    >
                      <div className="flex-shrink-0 w-16">
                        <p className="text-lg font-bold text-blue-600">
                          {vehicle.ticker}
                        </p>
                        <p className="text-sm font-semibold text-slate-600">
                          {vehicle.weight.toFixed(1)}%
                        </p>
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm text-slate-700">{vehicle.why}</p>
                      </div>

                      {/* Weight bar */}
                      <div className="w-32 flex-shrink-0">
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(vehicle.weight, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Layer total weight */}
                <div className="mt-4 pt-4 border-t-2 border-blue-500">
                  <p className="text-sm font-semibold text-slate-700">
                    Total Layer Weight:{" "}
                    <span className="text-blue-600">
                      {layer.vehicles
                        .reduce((sum, v) => sum + v.weight, 0)
                        .toFixed(1)}
                      %
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Signal-Driven Actions */}
      {allocation.signals.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-white mb-4">Market Signals</h3>
          <div className="space-y-3">
            {allocation.signals.map((signal, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${
                        signal.impact === "high"
                          ? "bg-red-500"
                          : signal.impact === "medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                    >
                      {signal.impact.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-bold text-slate-800 mb-1">
                      {signal.signal}
                    </h4>
                    <p className="text-sm text-slate-600">{signal.action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projected Returns */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-4">Projected Returns</h3>
        <div className="grid grid-cols-3 gap-4">
          {/* Base Case */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h4 className="font-bold text-slate-800 mb-2">Base Case</h4>
            <p className="text-sm text-slate-600 mb-3">Most likely scenario</p>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-slate-500">Min Return</p>
                <p className="text-2xl font-bold text-blue-600">
                  {allocation.projectedReturns.base.min}%
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Max Return</p>
                <p className="text-2xl font-bold text-blue-600">
                  {allocation.projectedReturns.base.max}%
                </p>
              </div>
            </div>
          </div>

          {/* Bull Case */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-500">
            <h4 className="font-bold text-slate-800 mb-2">Bull Case</h4>
            <p className="text-sm text-slate-600 mb-3">Optimistic scenario</p>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-slate-500">Min Return</p>
                <p className="text-2xl font-bold text-green-600">
                  {allocation.projectedReturns.bull.min}%
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Max Return</p>
                <p className="text-2xl font-bold text-green-600">
                  {allocation.projectedReturns.bull.max}%
                </p>
              </div>
            </div>
          </div>

          {/* Bear Case */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-red-500">
            <h4 className="font-bold text-slate-800 mb-2">Bear Case</h4>
            <p className="text-sm text-slate-600 mb-3">Pessimistic scenario</p>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-slate-500">Min Return</p>
                <p className="text-2xl font-bold text-red-600">
                  {allocation.projectedReturns.bear.min}%
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Max Return</p>
                <p className="text-2xl font-bold text-red-600">
                  {allocation.projectedReturns.bear.max}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Optimization */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-4">Tax Optimization</h3>
        <div className="space-y-3">
          {allocation.taxOptimization.nreDemat && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h4 className="font-bold text-slate-800 mb-2">NRE Demat Account</h4>
              <p className="text-sm text-slate-600">
                {allocation.taxOptimization.nreDemat}
              </p>
            </div>
          )}
          {allocation.taxOptimization.w8ben && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h4 className="font-bold text-slate-800 mb-2">Form W-8BEN</h4>
              <p className="text-sm text-slate-600">
                {allocation.taxOptimization.w8ben}
              </p>
            </div>
          )}
          {allocation.taxOptimization.savings && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h4 className="font-bold text-slate-800 mb-2">Savings Strategy</h4>
              <p className="text-sm text-slate-600">
                {allocation.taxOptimization.savings}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-sm text-amber-900">
        <p className="font-semibold mb-2">⚠️ Important Disclaimer</p>
        <p className="mb-2">
          This allocation is for informational purposes only. It is not
          investment advice. Please consult with a qualified financial advisor
          before making investment decisions.
        </p>
        <p>
          The projected returns are estimates based on historical data and
          current market conditions. Actual returns may vary significantly.
        </p>
      </div>
    </div>
  );
}
