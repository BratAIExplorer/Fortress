"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillSignal {
  label: string;
  value: string;
  sentiment?: "positive" | "negative" | "neutral";
}

interface SkillResultPayload {
  summary?: string;
  recommendation?: string;
  signals?: SkillSignal[];
  details?: string;
  error?: string;
}

interface SkillResultData {
  success?: boolean;
  skillName?: string;
  result?: SkillResultPayload;
  error?: string;
}

interface SkillResultProps {
  result: SkillResultData;
}

export function SkillResult({ result }: SkillResultProps) {
  if (!result) return null;

  const isError = !result.success || result.result?.error || result.error;
  const data = result.result;

  if (isError) {
    return (
      <Card className="border-red-500/20 bg-red-500/5">
        <CardContent className="py-8 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-400">Analysis failed</p>
            <p className="text-sm text-muted-foreground mt-1">
              {result.result?.error ?? result.error ?? "Unknown error occurred"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {data?.summary && (
        <Card className="border-primary/20 bg-card/50 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed">{data.summary}</p>
          </CardContent>
        </Card>
      )}

      {data?.signals && data.signals.length > 0 && (
        <Card className="border-primary/20 bg-card/50 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Signals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.signals.map((signal, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-background/40 px-3 py-2">
                  <span className="text-sm text-muted-foreground">{signal.label}</span>
                  <span className={cn(
                    "text-sm font-semibold font-mono",
                    signal.sentiment === "positive" && "text-emerald-400",
                    signal.sentiment === "negative" && "text-red-400",
                    (!signal.sentiment || signal.sentiment === "neutral") && "text-foreground"
                  )}>
                    {signal.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data?.recommendation && (
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="py-5 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-400 text-sm mb-1">Recommendation</p>
              <p className="text-sm text-foreground leading-relaxed">{data.recommendation}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {data?.details && (
        <Card className="border-primary/10 bg-card/30">
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{data.details}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
