"use client";

import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
});

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en" className="dark">
            <body
                className={cn(
                    "min-h-screen bg-background font-sans antialiased flex flex-col items-center justify-center text-center p-4",
                    inter.variable,
                    playfair.variable
                )}
            >
                <h2 className="text-3xl font-bold font-serif mb-4">Critical Error</h2>
                <p className="text-muted-foreground max-w-md mb-8">
                    The application encountered a critical error and cannot recover automatically.
                </p>
                <Button onClick={() => reset()}>Refresh Application</Button>
            </body>
        </html>
    );
}
