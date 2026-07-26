"use client";

import { MarketProvider } from "@/context/MarketContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MarketProvider>
      {children}
    </MarketProvider>
  );
}
