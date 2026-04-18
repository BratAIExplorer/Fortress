
"use client";

import { useEffect } from "react";

// Disable prerendering for this page since it requires a session
export const dynamic = "force-dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, ShieldCheck, AlertTriangle } from "lucide-react";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import { useOnboarding } from "@/hooks/useOnboarding";

export default function AdminDashboardPage() {
    const { showOnboarding, loading, completeOnboarding } = useOnboarding();

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
            <div className="space-y-6">
            <h1 className="text-3xl font-bold font-serif tracking-tight">Overview</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Stocks"
                    value="124"
                    description="Across all lists"
                    icon={<Activity className="h-4 w-4 text-muted-foreground" />}
                />
                <StatsCard
                    title="Fortress 30"
                    value="30/30"
                    description="Fully populated"
                    icon={<ShieldCheck className="h-4 w-4 text-primary" />}
                />
                <StatsCard
                    title="Pending Reviews"
                    value="12"
                    description="Quarterly check due"
                    icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
                />
                <StatsCard
                    title="Total Users"
                    value="1,203"
                    description="+15% from last month"
                    icon={<Users className="h-4 w-4 text-muted-foreground" />}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Admin logs will appear here.</p>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>System Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Database status: Connected (Mock)</p>
                    </CardContent>
                </Card>
            </div>
            </div>
        </>
    );
}

function StatsCard({ title, value, description, icon }: { title: string, value: string, description: string, icon: React.ReactNode }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    )
}
