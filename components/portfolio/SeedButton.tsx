"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Rocket, Loader2 } from "lucide-react";

export function SeedButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSeed() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portfolio/seed", { method: "POST" });
      const json = await res.json() as { success: boolean; error?: string };
      if (!json.success) throw new Error(json.error ?? "Seed failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        onClick={handleSeed}
        disabled={loading}
        size="lg"
        className="gap-2 bg-primary/90 hover:bg-primary text-primary-foreground"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Rocket className="h-4 w-4" />
        )}
        {loading ? "Creating strategy…" : "Create 10X Moonshot Strategy"}
      </Button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
