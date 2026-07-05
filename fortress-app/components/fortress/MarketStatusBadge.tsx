"use client";

import { useEffect, useState } from "react";
import type { MarketStatus } from "@/app/api/market/status/route";

type DisplayStatus = MarketStatus | "loading";

const CONFIG: Record<DisplayStatus, { label: string; color: string; dot: string; pulse: boolean }> = {
  open:    { label: "US Markets Open",     color: "text-emerald-400", dot: "bg-emerald-400", pulse: true  },
  pre:     { label: "US Pre-Market",       color: "text-amber-400",   dot: "bg-amber-400",   pulse: false },
  after:   { label: "US After-Hours",      color: "text-blue-400",    dot: "bg-blue-400",    pulse: false },
  closed:  { label: "US Markets Closed",   color: "text-slate-400",   dot: "bg-slate-500",   pulse: false },
  loading: { label: "Checking markets…",   color: "text-slate-500",   dot: "bg-slate-600",   pulse: false },
};

export function MarketStatusBadge() {
  const [status, setStatus] = useState<DisplayStatus>("loading");

  useEffect(() => {
    fetch("/api/market/status")
      .then((r) => r.json())
      .then((d) => setStatus((d.status as MarketStatus) ?? "closed"))
      .catch(() => setStatus("closed"));
  }, []);

  const { label, color, dot, pulse } = CONFIG[status];

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium tracking-wide ${color}`}>
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dot} ${pulse ? "animate-pulse" : ""}`} />
      {label}
    </span>
  );
}
