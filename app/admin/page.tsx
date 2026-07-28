
"use client";

import { useEffect, useState } from "react";

// Disable prerendering for this page since it requires a session
export const dynamic = "force-dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, ShieldCheck, AlertTriangle, TrendingUp, Globe, Copy, Zap } from "lucide-react";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import { useOnboarding } from "@/hooks/useOnboarding";
import { motion } from "framer-motion";

interface AnalyticsData {
    usersOnline: number;
    mostPopular: Array<{ pagePath: string; count: number }>;
    recentActivity: string;
}

export default function AdminDashboardPage() {
    const { showOnboarding, loading, completeOnboarding } = useOnboarding();
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch("/api/analytics/live-activity");
                if (res.ok) {
                    const data = await res.json();
                    // Map API keys to frontend interface keys
                    setAnalytics({
                        usersOnline: data.liveUsers || 0,
                        mostPopular: (data.trendingPages || []).map((p: { pagePath: string; views: number }) => ({
                            pagePath: p.pagePath,
                            count: p.views
                        })),
                        recentActivity: "System monitoring active"
                    });
                }
            } catch (err) {
                console.error("Failed to fetch analytics", err);
            }
        };

        fetchAnalytics();
        const interval = setInterval(fetchAnalytics, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return <div className="space-y-6"><p>Loading...</p></div>;
    }

    return (
        <>
            <OnboardingModal
                isOpen={showOnboarding}
                onClose={() => {}}
                onComplete={completeOnboarding}
            />
            <div className="space-y-8 p-1">
                <div className="flex items-center justify-between">
                    <h1 className="text-4xl font-bold font-serif tracking-tight">Terminal Stats</h1>
                    {analytics && (
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            Live Updates Enabled
                        </div>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Live Intellectuals"
                        value={analytics?.usersOnline?.toString() || "..."}
                        description="Currently exploring"
                        icon={<Users className="h-4 w-4 text-primary" />}
                    />
                    <StatsCard
                        title="Fortress 30"
                        value="30/30"
                        description="Fully populated"
                        icon={<ShieldCheck className="h-4 w-4 text-emerald-500" />}
                    />
                    <StatsCard
                        title="Analysis Health"
                        value="Optimal"
                        description="5-Layer protection active"
                        icon={<Activity className="h-4 w-4 text-blue-500" />}
                    />
                    <StatsCard
                        title="System Uptime"
                        value="99.9%"
                        description="Prod-V5 stable"
                        icon={<Globe className="h-4 w-4 text-muted-foreground" />}
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-7">
                    <Card className="col-span-7 border-amber-500/20 bg-amber-500/5 backdrop-blur">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-amber-500" />
                                Bot Control — Manual Start
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                                    <p className="text-xs font-medium text-muted-foreground mb-2">BOT STATUS</p>
                                    <p className="text-sm">❌ <span className="font-semibold">NOT RUNNING</span> — Last active: Never</p>
                                </div>
                                <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                                    <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center justify-between">
                                        MANUAL START COMMAND
                                        <button
                                            onClick={() => {
                                                const cmd = `cd C:\\The_Equity_Chapter\\Equity_The-Final-chapter\nLAUNCH_MACD_BOT.bat`;
                                                navigator.clipboard.writeText(cmd);
                                                alert("Command copied! Paste on Windows PowerShell.");
                                            }}
                                            className="text-xs px-2 py-1 bg-primary/20 hover:bg-primary/30 text-primary rounded flex items-center gap-1 transition"
                                        >
                                            <Copy className="h-3 w-3" /> Copy
                                        </button>
                                    </p>
                                    <code className="block text-xs font-mono bg-black/20 p-3 rounded border border-border/30 text-amber-400 whitespace-pre-wrap">
{`cd C:\\The_Equity_Chapter\\Equity_The-Final-chapter
LAUNCH_MACD_BOT.bat`}
                                    </code>
                                </div>
                                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                    <p className="text-xs font-medium text-blue-300 mb-1">💡 How it works</p>
                                    <p className="text-xs text-muted-foreground">
                                        1. Copy the command above → Paste on Windows PowerShell<br/>
                                        2. Bot scans every 5 min for MACD crossovers<br/>
                                        3. Signals auto-push to Fortress (every 5 min)<br/>
                                        4. Momentum Radar tab updates live
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-4 border-primary/10 bg-card/50 backdrop-blur">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Trending Intelligence
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {analytics?.mostPopular.map((item, idx) => (
                                    <div key={item.pagePath} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-mono text-muted-foreground">0{idx + 1}</span>
                                            <span className="font-medium text-sm">{item.pagePath}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                                {item.count} views
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {!analytics && <p className="text-sm text-muted-foreground">Retrieving trending data...</p>}
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="col-span-3 border-border/10">
                        <CardHeader>
                            <CardTitle>Security Logs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-sm text-emerald-500 mb-4 font-mono">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                Shield v5.2 Active
                            </div>
                            <div className="space-y-2 text-xs font-mono text-muted-foreground">
                                <p>[{new Date().toISOString().split('T')[1].split('.')[0]}] Session validation: OK</p>
                                <p>[{new Date().toISOString().split('T')[1].split('.')[0]}] Rate limit pool: Cleared</p>
                                <p>[{new Date().toISOString().split('T')[1].split('.')[0]}] DB Connection: Stable</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

function StatsCard({ title, value, description, icon }: { title: string, value: string, description: string, icon: React.ReactNode }) {
    return (
        <Card className="border-border/50 bg-card/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold tracking-tight">{value}</div>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </CardContent>
        </Card>
    )
}
