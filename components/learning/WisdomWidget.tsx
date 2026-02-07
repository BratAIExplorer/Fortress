
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Quote, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface Concept {
    term: string;
    definition: string;
    source: string;
    category: string;
}

export function WisdomWidget() {
    const [wisdom, setWisdom] = useState<Concept | null>(null);

    useEffect(() => {
        // Fetch random wisdom from our API (which calls the Server Action)
        fetch('/api/wisdom')
            .then(res => res.json())
            .then(data => setWisdom(data))
            .catch(err => console.error("Failed to fetch wisdom", err));
    }, []);

    if (!wisdom) return (
        <Card className="bg-muted/30 border-dashed animate-pulse h-[180px]">
            <CardContent className="h-full flex items-center justify-center text-muted-foreground">
                Loading Wisdom...
            </CardContent>
        </Card>
    );

    return (
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="h-24 w-24" />
            </div>

            <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-wider">
                    <Sparkles className="h-4 w-4" /> Daily Wisdom
                </div>
                <CardTitle className="text-xl font-serif">{wisdom.term}</CardTitle>
            </CardHeader>

            <CardContent>
                <div className="relative">
                    <Quote className="absolute -top-1 -left-2 h-6 w-6 text-muted-foreground/20 rotate-180" />
                    <p className="pl-6 italic text-muted-foreground leading-relaxed">
                        {wisdom.definition}
                    </p>
                </div>
                <div className="mt-4 text-right">
                    <span className="text-xs font-medium text-foreground">— {wisdom.source}</span>
                </div>
            </CardContent>
        </Card>
    );
}
