
"use client";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export function ConceptTooltip({ term, definition }: { term: string, definition: string }) {
    return (
        <TooltipProvider delayDuration={300}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className="cursor-help underline decoration-dotted underline-offset-4 decoration-muted-foreground/50 hover:text-primary hover:decoration-primary transition-colors">
                        {term}
                    </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs p-4 bg-popover border-primary/20 shadow-xl" side="top">
                    <div className="space-y-2">
                        <h4 className="font-serif font-bold text-primary">{term}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {definition}
                        </p>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
