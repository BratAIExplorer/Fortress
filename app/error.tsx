"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-2xl font-bold font-serif">Something went wrong!</h2>
            <p className="text-muted-foreground max-w-md">
                We apologize for the inconvenience. An unexpected error has occurred.
            </p>
            <Button onClick={() => reset()} variant="default">
                Try again
            </Button>
        </div>
    );
}
