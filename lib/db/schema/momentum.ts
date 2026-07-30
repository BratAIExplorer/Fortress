import { pgTable, uuid, varchar, numeric, integer, timestamp, index } from "drizzle-orm/pg-core";

// Read-only mirror of the standalone MACD crossover bot's "Currently Active"
// sheet. The bot (Equity_The-Final-chapter) pushes its scan output here via
// POST /api/analysis/momentum-signals; it never reads from this table.
export const macdSignals = pgTable(
  "macd_signals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    timeframe: varchar("timeframe", { length: 10 }).notNull(), // Daily | Weekly
    symbol: varchar("symbol", { length: 20 }).notNull(),
    cmp: numeric("cmp").notNull(),
    crossoverDate: varchar("crossover_date", { length: 20 }).notNull(),
    daysSinceCrossover: integer("days_since_crossover").notNull(),
    quantity: integer("quantity").notNull(),
    investedAmount: numeric("invested_amount").notNull(),
    firstTargetPrice: numeric("first_target_price"),
    // e.g. "5% Default (Blue Sky)" or "Weekly EMA 50" — bot sends full labels, not short codes
    firstTargetEma: varchar("first_target_ema", { length: 50 }),
    finalTargetPrice: numeric("final_target_price"),
    finalTargetEma: varchar("final_target_ema", { length: 50 }),
    stopLossPrice: numeric("stop_loss_price"),
    stopLossEma: varchar("stop_loss_ema", { length: 50 }),
    riskAmount: numeric("risk_amount"),
    // Cleared and re-inserted on every bot scan cycle (matches the bot's
    // own "Currently Active" sheet semantics — it's a snapshot, not a log).
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    symbolIdx: index("idx_macd_signals_symbol").on(table.symbol),
    timeframeIdx: index("idx_macd_signals_timeframe").on(table.timeframe),
  })
);

// Append-only log, separate from the snapshot table above. macd_signals gets
// wiped every scan cycle, so it can't answer "did signal X hit its target" —
// this table keeps one row per signal from first-seen until resolved, so the
// EOD job (and later, tuning recommendations) has something to measure against.
export const macdSignalLog = pgTable(
  "macd_signal_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    timeframe: varchar("timeframe", { length: 10 }).notNull(),
    symbol: varchar("symbol", { length: 20 }).notNull(),
    entryCmp: numeric("entry_cmp").notNull(),
    firstTargetPrice: numeric("first_target_price"),
    finalTargetPrice: numeric("final_target_price"),
    stopLossPrice: numeric("stop_loss_price"),
    // open | hit_t1 | hit_t2 | stopped
    status: varchar("status", { length: 20 }).notNull().default("open"),
    firstSeenAt: timestamp("first_seen_at").defaultNow().notNull(),
    resolvedAt: timestamp("resolved_at"),
  },
  (table) => ({
    statusIdx: index("idx_macd_signal_log_status").on(table.status),
    symbolIdx: index("idx_macd_signal_log_symbol").on(table.symbol),
  })
);
// ponytail: "one open row per symbol+timeframe" is enforced in the ingest
// route (check-then-insert), not a DB constraint — Postgres partial unique
// indexes aren't worth the schema complexity for a table this size.
