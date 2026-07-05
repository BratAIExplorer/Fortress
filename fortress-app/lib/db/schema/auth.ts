import { pgTable, text, varchar, timestamp, uuid, boolean, index } from "drizzle-orm/pg-core";

export const authUser = pgTable("auth_user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("email_verified"),
  image: text("image"),
  password: text("password"), // Hashed password for credentials provider
  isAdmin: boolean("is_admin").default(false).notNull(),
  
  // Password reset fields
  resetToken: varchar("reset_token", { length: 255 }),
  resetTokenExpires: timestamp("reset_token_expires"),
  
  // Onboarding fields
  hasSeenOnboarding: boolean("has_seen_onboarding").default(false).notNull(),
  onboardingViewedAt: timestamp("onboarding_viewed_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const passwordResetRequests = pgTable(
  "password_reset_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => authUser.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("idx_reset_user").on(table.userId),
    tokenIdx: index("idx_reset_token").on(table.token),
    expiresIdx: index("idx_reset_expires").on(table.expiresAt),
  })
);
