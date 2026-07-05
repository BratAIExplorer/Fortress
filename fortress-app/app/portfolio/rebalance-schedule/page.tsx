import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import { ChevronLeft, Calendar, Shield, TrendingDown } from "lucide-react";

export const dynamic = "force-dynamic";

function getNextQuarterlyDate(): { label: string; daysAway: number } {
  const now = new Date();
  const year = now.getFullYear();
  const quarters = [
    new Date(year, 2, 31),
    new Date(year, 5, 30),
    new Date(year, 8, 30),
    new Date(year, 11, 31),
    new Date(year + 1, 2, 31),
  ];
  const next = quarters.find((d) => d > now) ?? quarters[quarters.length - 1];
  const daysAway = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return {
    label: next.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    daysAway,
  };
}

export default async function RebalanceSchedulePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const next = getNextQuarterlyDate();

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        <Link
          href="/portfolio"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          My Portfolio
        </Link>

        <div>
          <h1 className="text-2xl font-bold font-serif">Rebalance Schedule</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quarterly discipline is what separates wealth builders from gamblers.
          </p>
        </div>

        {/* Next review countdown */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
          <Calendar className="h-8 w-8 text-primary mx-auto mb-3" />
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Next Quarterly Review</p>
          <p className="text-2xl font-bold font-mono text-foreground">{next.label}</p>
          <p className="text-sm text-primary font-semibold mt-1">
            {next.daysAway} day{next.daysAway !== 1 ? "s" : ""} away
          </p>
        </div>

        {/* Quarter calendar */}
        <div className="rounded-xl border border-primary/10 bg-card/60 p-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Annual Review Calendar
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { quarter: "Q1", date: "March 31"  },
              { quarter: "Q2", date: "June 30"   },
              { quarter: "Q3", date: "Sep 30"    },
              { quarter: "Q4", date: "Dec 31"    },
            ].map((q) => (
              <div key={q.quarter} className="rounded-lg bg-background/50 px-4 py-3">
                <p className="text-xs text-primary font-bold uppercase tracking-wider">{q.quarter}</p>
                <p className="font-mono font-semibold text-sm mt-0.5">{q.date}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Review + Rebalance</p>
              </div>
            ))}
          </div>
        </div>

        {/* Protocol steps */}
        <div className="rounded-xl border border-primary/10 bg-card/60 p-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            5-Step Rebalance Protocol
          </h2>
          <div className="space-y-3">
            {[
              { step: "1", title: "Open IBKR Portfolio",       desc: "Note current share counts and total value for each position." },
              { step: "2", title: "Update Holdings in Fortress", desc: "Edit each holding with latest units held and avg buy price." },
              { step: "3", title: "Read the Rebalance Actions", desc: "Fortress shows Buy / Trim / Hold for each position with dollar amounts." },
              { step: "4", title: "Execute in IBKR",            desc: "Place limit orders. Trim positions first, then deploy cash into buys." },
              { step: "5", title: "Mark as Rebalanced",         desc: "Hit the button in Fortress to reset the tracker for next quarter." },
            ].map((item) => (
              <div key={item.step} className="flex gap-3">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">
                  {item.step}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Blood rule */}
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-400" />
            <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider">Blood Rule</h2>
          </div>
          <div className="space-y-2">
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                Portfolio down 30–40%
              </p>
              <p className="text-sm text-foreground/80">
                Rebalance INTO leverage using gold proceeds.
              </p>
            </div>
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                Portfolio down 50–60%
              </p>
              <p className="text-sm text-foreground/80">
                Hold. Keep rebalancing on schedule. Do not panic sell.
              </p>
            </div>
            <div className="rounded-lg border border-primary/10 bg-primary/5 px-3 py-2.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                Any drawdown
              </p>
              <p className="text-sm font-semibold text-foreground">
                Never sell leverage at the bottom. That destroys the compounding.
              </p>
            </div>
          </div>
        </div>

        {/* Drift threshold */}
        <div className="rounded-xl border border-primary/10 bg-card/30 px-5 py-4">
          <div className="flex items-start gap-3">
            <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="text-primary font-semibold">5% drift threshold:</span>{" "}
              Fortress flags a rebalance only when a holding drifts more than 5% from its
              target weight. Small drift is normal and expected — only act when Fortress says to.
            </p>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Portfolio
          </Link>
        </div>

      </div>
    </div>
  );
}
