import { pgTable, text, varchar, timestamp, uuid, index } from "drizzle-orm/pg-core";

export const feedback = pgTable(
  "feedback",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    userEmail: varchar("user_email", { length: 255 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(), // 'bug', 'suggestion', 'validation', 'question'
    message: text("message").notNull(),
    pageUrl: varchar("page_url", { length: 512 }),
    stockTicker: varchar("stock_ticker", { length: 10 }),
    status: varchar("status", { length: 50 }).default("new").notNull(), // 'new', 'in_review', 'actioned', 'archived'
    internalNotes: text("internal_notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    reviewedAt: timestamp("reviewed_at"),
  },
  (table) => ({
    userIdIdx: index("idx_feedback_user_id").on(table.userId),
    statusIdx: index("idx_feedback_status").on(table.status),
    createdAtIdx: index("idx_feedback_created_at").on(table.createdAt),
    typeIdx: index("idx_feedback_type").on(table.type),
  })
);
