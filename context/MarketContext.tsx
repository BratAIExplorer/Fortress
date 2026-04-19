"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { MarketCode, DEFAULT_MARKET, MARKETS } from "@/lib/markets/config";

interface MarketContextValue {
  market: MarketCode;
  setMarket: (m: MarketCode) => void;
  isGlobal: boolean;
}

const MarketContext = createContext<MarketContextValue>({
  market: DEFAULT_MARKET,
  setMarket: () => {},
  isGlobal: false,
});

const STORAGE_KEY = "fortress_market";

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [market, setMarketState] = useState<MarketCode>(DEFAULT_MARKET);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as MarketCode | null;
    if (stored && stored in MARKETS) {
      setMarketState(stored);
    }
  }, []);

  const setMarket = useCallback((m: MarketCode) => {
    setMarketState(m);
    localStorage.setItem(STORAGE_KEY, m);
  }, []);

  return (
    <MarketContext.Provider value={{ market, setMarket, isGlobal: false }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  return useContext(MarketContext);
}
