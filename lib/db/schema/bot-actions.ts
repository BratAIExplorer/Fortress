import { pgTable, uuid, varchar, numeric, integer, timestamp, index } from "drizzle-orm/pg-core";

// Track user actions on momentum radar signals (buy/skip/sold)
// Minimal schema for feedback loop & AI learning
export const botUserActions = pgTable(
  "bot_user_actions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(), // Logged-in user
    symbol: varchar("symbol", { length: 20 }).notNull(), // e.g., "RELIANCE"
    timeframe: varchar("timeframe", { length: 10 }).notNull(), // "Daily" | "Weekly"
    action: varchar("action", { length: 20 }).notNull(), // "bought", "skipped", "sold"
    quantity: integer("quantity"), // Qty bought
    entryPrice: numeric("entry_price"), // Price entered at
    exitPrice: numeric("exit_price"), // Price exited at (if sold)
    outcome: varchar("outcome", { length: 20 }), // "win", "loss", "breakeven" (set after exit)
    pnl: numeric("pnl"), // Profit/loss amount
    notes: varchar("notes", { length: 500 }), // Optional user notes
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("idx_bot_actions_user").on(table.userId),
    symbolIdx: index("idx_bot_actions_symbol").on(table.symbol),
    actionIdx: index("idx_bot_actions_action").on(table.action),
    createdAtIdx: index("idx_bot_actions_created").on(table.createdAt),
  })
);
