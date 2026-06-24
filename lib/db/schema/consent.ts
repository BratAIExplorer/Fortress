import { pgTable, uuid, boolean, timestamp, varchar, index } from "drizzle-orm/pg-core";

export const privacyConsent = pgTable(
  "privacy_consent",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),

    // Consent flags
    dataCollection: boolean("data_collection").notNull(), // User agrees to behavioral tracking
    feedbackUsage: boolean("feedback_usage").notNull(), // User agrees feedback is stored/analyzed
    emailNotifications: boolean("email_notifications").default(false).notNull(),
    marketingEmails: boolean("marketing_emails").default(false).notNull(),

    // Version tracking for consent
    consentVersion: varchar("consent_version", { length: 10 }).default("1.0").notNull(),

    // Timestamps
    consentedAt: timestamp("consented_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("idx_consent_user_id").on(table.userId),
  })
);
