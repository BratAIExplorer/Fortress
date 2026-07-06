"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type MarketCode = "US" | "NSE" | "GLOBAL";

interface MarketContextType {
  market: MarketCode;
  setMarket: (market: MarketCode) => void;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export function MarketProvider({ children }: { children: ReactNode }) {
  const [market, setMarket] = useState<MarketCode>("US");

  return (
    <MarketContext.Provider value={{ market, setMarket }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error("useMarket must be used within MarketProvider");
  }
  return context;
}
