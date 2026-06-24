import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BackButton } from "@/components/fortress/BackButton";
import { MyAllocationsClient } from "@/components/my-allocations/MyAllocationsClient";
import { getAllocationsByUserId } from "@/lib/my-allocations/queries";

export const dynamic = "force-dynamic";

export default async function MyAllocationsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const allocations = await getAllocationsByUserId(session.user.id);

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <BackButton fallbackHref="/investment-genie" className="mb-8" />

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold font-serif text-white mb-3 tracking-tight">
            📊 My Allocations
          </h1>
          <p className="text-lg text-muted-foreground font-light">
            Portfolio snapshots you've saved • Read-only history
          </p>
        </div>

        {/* Info Banner */}
        <div className="mb-8 bg-slate-900/40 border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm">
          <p className="text-slate-300 text-sm leading-relaxed">
            Each row represents a portfolio allocation snapshot you saved in Investment Genie.
            Use this to track your allocation decisions over time and compare different scenarios.
          </p>
        </div>

        {/* Content */}
        <MyAllocationsClient initialAllocations={allocations} />
      </div>
    </div>
  );
}
