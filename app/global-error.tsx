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
    reset,
}: {
    _error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <h2>Something went wrong!</h2>
                    <button onClick={() => reset()}>Try again</button>
                </div>
            </body>
        </html>
    );
}
