"use client";

import { useMarket } from "@/context/MarketContext";
import { MARKET_LIST, MarketCode } from "@/lib/markets/config";
import { cn } from "@/lib/utils";

interface MarketSelectorProps {
  className?: string;
  size?: "sm" | "md";
}

export function MarketSelector({ className, size = "md" }: MarketSelectorProps) {
  const { market, setMarket } = useMarket();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-xl border border-white/10 bg-white/5 p-1 gap-1",
        className
      )}
      role="group"
      aria-label="Select market"
    >
      {MARKET_LIST.map((m) => (
        <button
          key={m.code}
          onClick={() => setMarket(m.code as MarketCode)}
          aria-pressed={market === m.code}
          className={cn(
            "flex items-center gap-1.5 rounded-lg font-medium transition-all",
            size === "sm"
              ? "px-2.5 py-1 text-[11px]"
              : "px-3 py-1.5 text-xs",
            market === m.code
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-white hover:bg-white/5"
          )}
        >
          <span>{m.flag}</span>
          <span className="hidden sm:inline">{m.label}</span>
          <span className="sm:hidden">{m.code}</span>
        </button>
      ))}
    </div>
  );
}
