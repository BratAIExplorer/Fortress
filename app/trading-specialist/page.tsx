import { TradingSpecialist } from "@/components/fortress/TradingSpecialist";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hidden Gem Finder | Fortress Intelligence",
  description: "AI trading specialist — analyze tickers, find entry points, manage risk",
};

export default function TradingSpecialistPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-serif">
          Hidden Gem Finder
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Your personal AI trading specialist. Analyze any ticker, understand the signals, find the right entry point.
        </p>
      </div>

      {/* Main Content */}
      <TradingSpecialist />
    </div>
  );
}
