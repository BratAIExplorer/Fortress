
"use client";

import React, { createContext, useContext, useState } from "react";

export type RiskMode = "Conservative" | "Balanced" | "Aggressive";

interface RiskContextType {
    mode: RiskMode;
    setMode: (mode: RiskMode) => void;
}

const RiskContext = createContext<RiskContextType | undefined>(undefined);

export function RiskProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<RiskMode>("Balanced");

    return (
        <RiskContext.Provider value={{ mode, setMode }}>
            {children}
        </RiskContext.Provider>
    );
}

export function useRisk() {
    const context = useContext(RiskContext);
    if (context === undefined) {
        throw new Error("useRisk must be used within a RiskProvider");
    }
    return context;
}
