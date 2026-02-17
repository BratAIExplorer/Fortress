"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ThesesPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-serif tracking-tight">Theses Management</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        This module is currently under development. You can manage theses through the
                        <strong> Stocks</strong> section by editing individual stock entries.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
