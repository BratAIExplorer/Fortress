"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, ShieldCheck, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Status {
    activeSignalCount: number;
    lastUpdated: string | null;
    minutesSinceUpdate: number | null;
    marketHoursNow: boolean;
    stale: boolean;
    staleThresholdMinutes: number;
}

export default function MomentumRadarAdminPage() {
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState<Status | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const checkStatus = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/momentum-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            if (res.ok) {
                setStatus(data);
            } else {
                setError(data.error === "INVALID_PASSWORD" ? "Wrong password." : "Status check failed.");
                setStatus(null);
            }
        } catch {
            setError("Network error.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <main className="container max-w-2xl mx-auto px-4 sm:px-8 py-12 space-y-8">
                <div>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mb-3">Bot Health</Badge>
                    <h1 className="text-3xl font-bold font-serif flex items-center gap-2">
                        <ShieldCheck className="h-7 w-7 text-purple-400" /> Momentum Radar — Admin
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Standalone health check for the MACD scanner bot feeding the Momentum Radar tab.
                    </p>
                </div>

                {!status && (
                    <Card className="bg-white/5 border-white/10">
                        <CardContent className="p-5 space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Enter password</span>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && checkStatus()}
                                    className="h-9 text-sm bg-white/5 border-white/10 flex-1"
                                />
                                <Button size="sm" onClick={checkStatus} disabled={loading || !password} className="h-9 px-4">
                                    {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : "View Status"}
                                </Button>
                            </div>
                            {error && <p className="text-xs text-red-400">{error}</p>}
                        </CardContent>
                    </Card>
                )}

                {status && (
                    <div className="space-y-4">
                        <Card className={cn("border", status.stale ? "bg-amber-500/5 border-amber-500/20" : "bg-emerald-500/5 border-emerald-500/20")}>
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Bot Status</p>
                                    <p className={cn("text-lg font-bold", status.stale ? "text-amber-400" : "text-emerald-400")}>
                                        {status.stale ? "Stale — check the bot" : "Healthy"}
                                    </p>
                                </div>
                                <Button size="sm" variant="outline" onClick={checkStatus} disabled={loading} className="gap-1.5">
                                    <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} /> Refresh
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-white/5 border-white/10">
                                <CardContent className="p-4">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Active Signals</p>
                                    <p className="text-2xl font-bold font-mono text-white">{status.activeSignalCount}</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-white/5 border-white/10">
                                <CardContent className="p-4">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Last Push</p>
                                    <p className="text-2xl font-bold font-mono text-white">
                                        {status.minutesSinceUpdate === null ? "Never" : `${status.minutesSinceUpdate}m ago`}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="bg-white/5 border-white/10">
                            <CardContent className="p-4 space-y-1 text-xs text-muted-foreground">
                                <p>Last updated: {status.lastUpdated ? new Date(status.lastUpdated).toLocaleString("en-IN") : "—"}</p>
                                <p>NSE market hours right now: {status.marketHoursNow ? "Yes" : "No"}</p>
                                <p>Flagged stale if no push for &gt;{status.staleThresholdMinutes} min during market hours.</p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    );
}
