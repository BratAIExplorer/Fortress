"use client";

import { Allocation, UserProfile } from "@/lib/investment-genie/contracts";
import { cn } from "@/lib/utils";

interface AllocationResultProps {
  allocation: Allocation;
  profile: UserProfile;
}

export default function AllocationResult({
  allocation,
  profile,
}: AllocationResultProps) {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Summary Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -mr-32 -mt-32" />
        
        <h2 className="text-3xl font-bold font-serif text-white mb-6 relative z-10">Your Personalized Allocation</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-widest text-white/40">Portfolio Value</p>
            <p className="text-2xl font-bold text-white">${profile.amount.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-widest text-white/40">Time Horizon</p>
            <p className="text-2xl font-bold text-white capitalize">
              {profile.horizon === "retirement" ? "Retirement" : profile.horizon}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-widest text-white/40">Risk Appetite</p>
            <p className="text-2xl font-bold text-primary">{profile.riskAppetite}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-widest text-white/40">Proficiency</p>
            <p className="text-2xl font-bold text-white capitalize">{profile.experience}</p>
          </div>
        </div>
      </div>

      {/* Allocation Layers */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-px flex-grow bg-white/10" />
          <h3 className="text-xl font-bold font-serif text-white/90">Curated Portfolio Layers</h3>
          <div className="h-px flex-grow bg-white/10" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.values(allocation.layers).map((layer) => (
            <div
              key={layer.name}
              className="group bg-card/40 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-500"
            >
              <div className="bg-gradient-to-r from-white/5 to-transparent px-6 py-5 border-b border-white/5">
                <h4 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{layer.name}</h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{layer.why}</p>
              </div>

              <div className="p-6 space-y-5">
                {/* Layer vehicles */}
                <div className="space-y-4">
                  {layer.vehicles.map((vehicle) => (
                    <div
                      key={vehicle.ticker}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-primary">{vehicle.ticker}</span>
                          <span className="text-[10px] font-medium text-white/30 uppercase tracking-tighter">Equity</span>
                        </div>
                        <span className="text-sm font-bold text-white">{vehicle.weight.toFixed(1)}%</span>
                      </div>
                      
                      {/* Weight bar */}
                      <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-primary/60 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(var(--primary),0.3)]"
                          style={{ width: `${Math.min(vehicle.weight, 100)}%` }}
                        />
                      </div>
                      
                      <p className="text-[11px] text-muted-foreground leading-relaxed italic opacity-80 group-hover:opacity-100 transition-opacity">
                        {vehicle.why}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Layer total weight */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Total Weight</span>
                  <span className="text-sm font-bold text-primary">
                    {layer.vehicles
                      .reduce((sum, v) => sum + v.weight, 0)
                      .toFixed(1)}
                    %
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Signals */}
      {allocation.signals.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold font-serif text-white/90">Institutional Intelligence Signals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allocation.signals.map((signal, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/[0.07] transition-colors">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "flex-shrink-0 w-2 h-2 rounded-full mt-1.5 shadow-[0_0_10px_currentColor]",
                    signal.impact === "high" ? "bg-red-500 text-red-500" : 
                    signal.impact === "medium" ? "bg-amber-500 text-amber-500" : "bg-emerald-500 text-emerald-500"
                  )} />
                  <div className="flex-grow">
                    <h4 className="text-sm font-bold text-white mb-1">
                      {signal.signal}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{signal.action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Return Projections */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold font-serif text-white/90">90-Day Sovereign Projections</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Bear Case */}
          <div className="bg-card/40 border-l-2 border-red-500/50 rounded-xl p-6 hover:translate-y-[-4px] transition-transform duration-300">
            <h4 className="text-xs font-bold uppercase tracking-widest text-red-400/80 mb-4 font-mono">Bear Case</h4>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-white">{allocation.projectedReturns.bear.min}%</span>
              <span className="text-xs text-white/30 mb-1.5">to</span>
              <span className="text-xl font-bold text-white/70">{allocation.projectedReturns.bear.max}%</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-4">Pessimistic market downturn scenario</p>
          </div>

          {/* Base Case */}
          <div className="bg-card/40 border-l-2 border-primary/50 rounded-xl p-6 hover:translate-y-[-4px] transition-transform duration-300">
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary/80 mb-4 font-mono">Base Case</h4>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-white">{allocation.projectedReturns.base.min}%</span>
              <span className="text-xs text-white/30 mb-1.5">to</span>
              <span className="text-xl font-bold text-white/70">{allocation.projectedReturns.base.max}%</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-4">Most probable institutional forecast</p>
          </div>

          {/* Bull Case */}
          <div className="bg-card/40 border-l-2 border-emerald-500/50 rounded-xl p-6 hover:translate-y-[-4px] transition-transform duration-300">
            <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400/80 mb-4 font-mono">Bull Case</h4>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-white">{allocation.projectedReturns.bull.min}%</span>
              <span className="text-xs text-white/30 mb-1.5">to</span>
              <span className="text-xl font-bold text-white/70">{allocation.projectedReturns.bull.max}%</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-4">Optimistic macro tailwind scenario</p>
          </div>
        </div>
      </div>

      {/* Sovereign Optimization Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "NRE Account", value: allocation.taxOptimization.nreDemat, icon: "🏦" },
          { title: "W-8BEN", value: allocation.taxOptimization.w8ben, icon: "📄" },
          { title: "Strategy", value: allocation.taxOptimization.savings, icon: "💡" }
        ].map((item, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-2xl mb-4">{item.icon}</div>
            <h4 className="text-sm font-bold text-white mb-2">{item.title}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Compliance Footer */}
      <div className="bg-amber-950/20 border border-amber-500/10 rounded-2xl p-6 text-center">
        <p className="text-[10px] text-amber-200/50 leading-relaxed max-w-2xl mx-auto italic">
          Institutional Grade Disclaimer: This blueprint is algorithmically generated based on provided risk parameters. 
          It does not constitute fiduciary advice. Past performance is an indicator of thesis validity, not a guarantee of future returns. 
          Consult with a certified Sovereign Wealth advisor.
        </p>
      </div>
    </div>
  );
}
