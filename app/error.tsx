"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        console.error("Application error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-4">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold font-serif">Oops!</h2>
                    <p className="text-muted-foreground">
                        Something went wrong. We apologize for the inconvenience.
                    </p>
                </div>

                {showDetails && error?.message && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded p-3 text-left">
                        <p className="text-sm text-destructive font-mono break-all">
                            {error.message}
                        </p>
                    </div>
                )}

                <div className="flex gap-2 pt-4">
                    <Button onClick={() => reset()} className="flex-1">
                        Try Again
                    </Button>
                    <Button variant="outline" asChild className="flex-1">
                        <Link href="/">Go Home</Link>
                    </Button>
                </div>

                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full pt-2"
                >
                    {showDetails ? "Hide details" : "Show error details"}
                </button>
            </div>
        </div>
    );
}
