
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export function WhyBox({ stock }: { stock: any }) {
    return (
        <Card className="h-full border-primary/20 bg-primary/5">
            <CardHeader>
                <CardTitle className="text-xl font-serif text-primary flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" /> The Thesis
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">One-Liner</h4>
                    <p className="text-lg font-medium leading-relaxed">
                        "The lowest cost producer in the world with a fortress balance sheet."
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                    <div>
                        <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider mb-2">Megatrends</h4>
                        <div className="flex flex-wrap gap-2">
                            {stock.megatrend.map((m: string) => (
                                <Badge key={m} variant="secondary">{m}</Badge>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider mb-2">Moat Source</h4>
                        <Badge variant="outline">Scale Economies</Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
