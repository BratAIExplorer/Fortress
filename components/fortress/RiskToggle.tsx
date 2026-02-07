
"use client";

import { useRisk, RiskMode } from "./RiskContext";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const modes: RiskMode[] = ["Conservative", "Balanced", "Aggressive"];

export function RiskToggle() {
    const { mode, setMode } = useRisk();

    return (
        <div className="flex items-center justify-center p-1 bg-muted/50 rounded-full border">
            {modes.map((m) => {
                const isActive = mode === m;
                return (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={cn(
                            "relative px-4 py-2 text-sm font-medium transition-colors rounded-full z-10",
                            isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeRest"
                                className="absolute inset-0 bg-primary rounded-full -z-10"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                        {m}
                    </button>
                );
            })}
        </div>
    );
}
