
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


import { Stock } from "@/lib/types";

export function Financials({ stock }: { stock: Stock }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-medium">Protection Filter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <Metric label="ROCE (5yr Avg)" value={`${stock.roce_5yr_avg || 0}%`} threshold={15} />
                <Metric label="Debt-to-Equity" value={`${stock.debt_to_equity || 0}`} threshold={0.6} inverse />
                {/* These fields might not be in Stock interface yet based on schema seeing, assuming they exist or need to be handled gracefully if missing */}
                <Metric label="Market Cap" value={`₹${(stock.market_cap_crores / 1000).toFixed(1)}k Cr`} threshold={0} />
                <Metric label="P/E Ratio" value={`${stock.pe_ratio || 0}x`} threshold={0} inverse />
            </CardContent>
        </Card>
    );
}

function Metric({ label, value, threshold, inverse = false }: { label: string, value: string, threshold: number, inverse?: boolean }) {
    // Mock progress calculation
    const numValue = parseFloat(value.replace(/[^0-9.]/g, ''));
    const max = inverse ? 1.0 : 30; // Arbitrary max for visualization
    const percentage = Math.min((numValue / max) * 100, 100);

    return (
        <div className="space-y-1">
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-mono font-bold">{value}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary/20 overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
            </div>
        </div>
    )
}
