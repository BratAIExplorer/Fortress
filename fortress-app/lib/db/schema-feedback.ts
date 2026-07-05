import { pgTable, uuid, text, varchar, numeric, timestamp, jsonb, integer } from 'drizzle-orm/pg-core';
import { allocations } from './schema';
import { relations } from 'drizzle-orm';

// Track user interactions with allocations (events)
export const allocationFeedback = pgTable('allocation_feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  allocationId: uuid('allocation_id').references(() => allocations.id),
  userId: varchar('user_id', { length: 36 }),
  action: text('action'), // 'preset_viewed', 'preset_applied', 'custom_edited', 'saved', 'reviewed'
  presetVariant: text('preset_variant'), // 'aggressive_growth' | 'aggressive_growth_v2' | null
  formFieldsChanged: jsonb('form_fields_changed'), // {horizon: '5yr', countries: ['US', 'INDIA']}
  confidenceScore: numeric('confidence_score', { precision: 3, scale: 2 }), // 0-1
  createdAt: timestamp('created_at').defaultNow(),
});

// Aggregated user preferences (computed weekly)
export const userPreferencesLearned = pgTable('user_preferences_learned', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 36 }),
  riskAppetiteTrend: numeric('risk_appetite_trend', { precision: 5, scale: 2 }), // 0-100
  riskAppetiteVolatility: numeric('risk_appetite_volatility', { precision: 5, scale: 2 }), // std dev
  horizonPreference: text('horizon_preference'), // 'short' | 'medium' | 'long' | 'retirement' | 'mixed'
  marketPreference: jsonb('market_preference'), // {US: 60, NSE: 40}
  rebalanceFrequencyDays: numeric('rebalance_frequency_days', { precision: 5, scale: 1 }),
  customizationLevel: numeric('customization_level', { precision: 3, scale: 2 }), // 0-1
  presetAffinity: text('preset_affinity'), // 'aggressive_growth' | null
  preferredExperience: text('preferred_experience'), // 'preset_first' | 'blank_canvas' | 'historical_variants'
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Learned preset variants per user
export const presetVariants = pgTable('preset_variants', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 36 }),
  basePreset: text('base_preset'), // 'aggressive_growth'
  variantName: text('variant_name'), // 'aggressive_growth_tech_focused_v1'
  config: jsonb('config'), // modified preset values
  createdAt: timestamp('created_at').defaultNow(),
  preferredByCount: integer('preferred_by_count').default(0),
});

// Relations
export const allocationFeedbackRelations = relations(allocationFeedback, ({ one }) => ({
  allocation: one(allocations, {
    fields: [allocationFeedback.allocationId],
    references: [allocations.id],
  }),
}));
