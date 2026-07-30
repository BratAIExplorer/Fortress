/**
 * ResearchDisclaimer — shared point-of-use disclaimer.
 *
 * Placed on every analytical surface so the disclosure sits where the user
 * actually reads the output, not only in Terms. Wording and styling follow the
 * existing Clarity Panel disclaimer for consistency.
 *
 * Variants exist because the accurate wording differs by surface: a screen that
 * shows target prices needs different language from one that shows a user's own
 * holdings.
 */

const COPY = {
  /** Momentum Radar — technical scan output including target and stop levels. */
  signals:
    "This scan reports technical indicator states across a stock universe. It is research and analysis, not financial advice, and is not a recommendation to buy or sell any security. Target and stop levels shown are arithmetic derivations of the indicator, not price predictions or advice to transact. The same information is published to all users and is not tailored to anyone's circumstances. All decisions remain with the investor.",

  /** Hidden Gem Finder — per-ticker technical and fundamental analysis. */
  analysis:
    "This analysis reports technical and fundamental indicator values for the ticker you selected. It is research and analysis, not financial advice, and is not a recommendation to buy or sell any security. Labels and confidence figures describe how many indicator conditions are currently met — they are not predictions of future performance. All decisions remain with the investor.",

  /** Portfolio — figures computed from holdings the user entered themselves. */
  portfolio:
    "These figures are calculated from holdings you entered yourself and are provided for your own record-keeping. They are not financial advice, a recommendation to buy or sell any security, or a personal recommendation. Weight and drift calculations show arithmetic differences against targets you set — acting on them is entirely your decision.",
} as const;

export type DisclaimerVariant = keyof typeof COPY;

export function ResearchDisclaimer({
  variant,
  className = "",
}: {
  variant: DisclaimerVariant;
  className?: string;
}) {
  return (
    <div
      role="note"
      aria-label="Important disclosure"
      className={`rounded-xl border border-white/5 bg-white/[0.02] p-4 ${className}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
        Important disclosure
      </p>
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        {COPY[variant]}{" "}
        Past performance does not guarantee future results. Investing carries
        risk of loss. Fortress Intelligence is not a licensed investment
        adviser. See our{" "}
        <a href="/terms" className="underline hover:text-foreground transition-colors">
          Terms
        </a>{" "}
        for full details.
      </p>
    </div>
  );
}
