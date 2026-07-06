"use client";

import { useMarket } from "@/context/MarketContext";
import { MARKET_LIST, MarketCode, MARKETS } from "@/lib/markets/config";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

// Pages that use URL-based market routing (param name by path)
const URL_ROUTED_PAGES: Record<string, string> = {
  "/fortress-30": "market",
  "/v5-extension": "market",
  "/stocks": "market",
};

interface MarketSelectorProps {
  className?: string;
  size?: "sm" | "md";
}

export function MarketSelector({ className, size = "md" }: MarketSelectorProps) {
  const { market, setMarket } = useMarket();
  const pathname = usePathname();
  const router = useRouter();

  const urlParam = URL_ROUTED_PAGES[pathname];

  // ponytail: for URL-routed pages, try to read from URL; for others, use context
  let displayMarket = market;
  if (urlParam) {
    try {
      const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
      displayMarket = (params.get(urlParam) ?? market) as MarketCode;
    } catch {
      // Fall back to context if URL read fails
    }
  }

  const handleSelect = (code: MarketCode) => {
    if (code === displayMarket) return; // No change

    setMarket(code);

    // Show market switch notification
    const marketLabel = MARKETS[code].label;
    const marketEmoji = code === "US" ? "🇺🇸" : "🇮🇳";
    toast.success(`Switched to ${marketEmoji} ${marketLabel} market`, {
      duration: 2000,
      description: `Now viewing ${marketLabel} data`
    });

    if (urlParam) {
      router.push(`${pathname}?${urlParam}=${code}`);
    }
  };

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
          onClick={() => handleSelect(m.code as MarketCode)}
          aria-pressed={displayMarket === m.code}
          className={cn(
            "flex items-center gap-1.5 rounded-lg font-medium transition-all",
            size === "sm"
              ? "px-2.5 py-1 text-[11px]"
              : "px-3 py-1.5 text-xs",
            displayMarket === m.code
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-white hover:bg-white/5"
          )}
        >
          <span className="hidden sm:inline">{m.label}</span>
          <span className="sm:hidden">{m.code}</span>
        </button>
      ))}
    </div>
  );
}
