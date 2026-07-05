"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  fallbackHref?: string;
  className?: string;
  label?: string;
}

export function BackButton({
  fallbackHref = "/",
  className,
  label = "Back",
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className={cn("gap-2 text-muted-foreground hover:text-foreground", className)}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}
