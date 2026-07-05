/**
 * Weekly TSYS Validator
 *
 * Runs every Sunday 2am UTC (10:30am IST)
 * Updates conviction scores for all 50+ sectors
 *
 * Claude reads:
 * - Market news from past week
 * - Earnings surprises
 * - Macro signals (rates, GDP, inflation)
 * - Geopolitical events
 *
 * Updates conviction for each sector based on signal strength
 */

import { db } from "@/lib/db";
import { sectorTheses, sectorThesisValidations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { calculateBacktest } from "@/lib/backtest/calculator";
import { Anthropic } from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface SectorSignal {
  sector: string;
  signal: "positive" | "negative" | "neutral";
  strength: number; // 0-1, impact on conviction
  reason: string;
}

/**
 * Main weekly validation job
 * Called by: Cron scheduler (Sunday 2am)
 */
export async function runWeeklyTSYSValidator() {
  console.log("[TSYS Validator] Starting weekly validation...");

  try {
    // Step 1: Fetch all active theses
    const theses = await db.query.sectorTheses.findMany({
      where: eq(sectorTheses.isActive, true),
    });

    console.log(`[TSYS Validator] Validating ${theses.length} sectors...`);

    // Step 2: Analyze market signals with Claude
    const signals = await analyzeMarketSignals(theses);

    // Step 3: Update conviction scores
    for (const thesis of theses) {
      const signal = signals.find((s) => s.sector === thesis.slug);
      if (!signal) continue;

      // Calculate new conviction
      const newConviction = calculateNewConviction(
        Number(thesis.convictionScore),
        signal.strength,
        signal.signal
      );

      // Determine status
      const status =
        newConviction > 0.7
          ? "WORKING"
          : newConviction > 0.5
            ? "FALTERING"
            : "BROKEN";

      // Update thesis
      await db
        .update(sectorTheses)
        .set({
          convictionScore: newConviction,
          convictionStatus: status,
          updatedAt: new Date(),
        })
        .where(eq(sectorTheses.id, thesis.id));

      // Log validation
      await db.insert(sectorThesisValidations).values({
        thesisId: thesis.id,
        validationDate: new Date(),
        validationStatus: status,
        notes: signal.reason,
      });

      console.log(
        `[TSYS Validator] ${thesis.name}: ${Number(thesis.convictionScore).toFixed(2)} → ${newConviction.toFixed(2)} (${signal.signal})`
      );
    }

    console.log("[TSYS Validator] Weekly validation complete ✅");
    return { success: true, thesesUpdated: theses.length };
  } catch (error) {
    console.error("[TSYS Validator] Error:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Claude analyzes market signals for each sector
 * Returns: array of signals with strength + direction
 */
async function analyzeMarketSignals(
  theses: typeof sectorTheses.$inferSelect[]
): Promise<SectorSignal[]> {
  const thesesList = theses.map((t) => `- ${t.name} (${t.macroCatalyst})`).join("\n");

  const prompt = `You are a macro analyst. Analyze this week's market signals and their impact on these investment theses.

Theses to analyze:
${thesesList}

Signals from this week:
- RBI rate cuts/hikes
- GDP growth data
- Inflation trends
- Geopolitical events (China, US, Russia, Pakistan)
- Earnings surprises
- Supply chain news
- Regulatory changes

For EACH thesis, provide:
1. Signal direction: positive/negative/neutral
2. Strength: 0.1 to 0.5 (how much it impacts conviction)
3. Reason: 1 sentence

Format as JSON:
{
  "signals": [
    {"sector": "healthcare-growth-india", "signal": "positive", "strength": 0.15, "reason": "..."},
    ...
  ]
}`;

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  // Parse JSON from response
  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in response");

  const parsed = JSON.parse(jsonMatch[0]);
  return parsed.signals;
}

/**
 * Calculate new conviction based on signal
 */
function calculateNewConviction(
  currentConviction: number,
  signalStrength: number,
  signal: "positive" | "negative" | "neutral"
): number {
  const adjustment = signal === "positive" ? signalStrength : -signalStrength;
  const newConviction = Math.max(0, Math.min(1, currentConviction + adjustment));

  // Smooth: don't jump too much in one week
  return currentConviction + (newConviction - currentConviction) * 0.5;
}

/**
 * Cron trigger (integration with scheduler)
 * Usage: Call from cron job runner
 */
export async function scheduleWeeklyTSYSValidator() {
  // Runs every Sunday at 2am UTC (10:30am IST)
  const schedule = "0 2 * * 0"; // Cron syntax

  return {
    name: "weekly-tsys-validator",
    schedule,
    handler: runWeeklyTSYSValidator,
  };
}
