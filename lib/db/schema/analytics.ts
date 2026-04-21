import { pgTable, uuid, text, timestamp, index, varchar } from "drizzle-orm/pg-core";

export const pageViews = pgTable("page_views", {
    id: uuid("id").primaryKey().defaultRandom(),
    pagePath: text("page_path").notNull(),
    userId: varchar("user_id", { length: 36 }),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow(),
}, (table) => ({
    pagePathIndex: index("idx_page_views_path").on(table.pagePath),
    timestampIndex: index("idx_page_views_time").on(table.timestamp),
    userIdIndex: index("idx_page_views_user").on(table.userId),
}));

export const liveActivity = pgTable("live_activity", {
    id: uuid("id").primaryKey().defaultRandom(),
    pagePath: text("page_path").notNull(),
    userId: varchar("user_id", { length: 36 }),
    sessionId: text("session_id").notNull(),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
    sessionIndex: index("idx_live_activity_session").on(table.sessionId),
    lastActiveIndex: index("idx_live_activity_time").on(table.lastActiveAt),
}));
