import { pgTable, serial, varchar, timestamp, text, index } from "drizzle-orm/pg-core";

export const pageViews = pgTable("page_views", {
  id: serial("id").primaryKey(),
  pagePath: varchar("page_path", { length: 255 }).notNull(),
  userIp: varchar("user_ip", { length: 45 }), // Support IPv6
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  pagePathIdx: index("idx_page_views_path").on(table.pagePath),
  createdAtIdx: index("idx_page_views_created").on(table.createdAt),
}));
