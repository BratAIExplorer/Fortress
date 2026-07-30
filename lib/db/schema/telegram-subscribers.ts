import { pgTable, uuid, varchar, boolean, timestamp } from "drizzle-orm/pg-core";

// Additional Telegram recipients for Momentum Radar crossover alerts, managed
// from /momentum-radar/admin. The bot always sends to TELEGRAM_ADMIN_ID
// (unchanged, still the only one with admin-command permission) plus every
// active row here — this table never replaces or overrides the admin ID.
export const telegramSubscribers = pgTable("telegram_subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  chatId: varchar("chat_id", { length: 32 }).notNull().unique(),
  label: varchar("label", { length: 100 }),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
