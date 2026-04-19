"use client";

import { SessionProvider } from "next-auth/react";
import { MarketProvider } from "@/context/MarketContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MarketProvider>
        {children}
      </MarketProvider>
    </SessionProvider>
  );
}
