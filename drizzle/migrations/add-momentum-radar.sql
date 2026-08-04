-- Momentum Radar tab: subscription gating column + signals mirror table.
-- Additive only — safe for the 8 existing accounts (Session 29 note):
--   * subscription_status gets a DEFAULT so existing rows backfill to 'trial'
--     automatically, no existing data touched or removed.
--   * macd_signals is a brand-new table (nothing to migrate into it).

ALTER TABLE "auth_user"
  ADD COLUMN IF NOT EXISTS "subscription_status" varchar(20) NOT NULL DEFAULT 'trial';

CREATE TABLE IF NOT EXISTS "macd_signals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "timeframe" varchar(10) NOT NULL,
  "symbol" varchar(20) NOT NULL,
  "cmp" numeric NOT NULL,
  "crossover_date" varchar(20) NOT NULL,
  "days_since_crossover" integer NOT NULL,
  "quantity" integer NOT NULL,
  "invested_amount" numeric NOT NULL,
  "first_target_price" numeric,
  "first_target_ema" varchar(10),
  "final_target_price" numeric,
  "final_target_ema" varchar(10),
  "stop_loss_price" numeric,
  "stop_loss_ema" varchar(10),
  "risk_amount" numeric,
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_macd_signals_symbol" ON "macd_signals" ("symbol");
CREATE INDEX IF NOT EXISTS "idx_macd_signals_timeframe" ON "macd_signals" ("timeframe");

CREATE TABLE IF NOT EXISTS "macd_signal_log" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "timeframe" varchar(10) NOT NULL,
  "symbol" varchar(20) NOT NULL,
  "entry_cmp" numeric NOT NULL,
  "first_target_price" numeric,
  "final_target_price" numeric,
  "stop_loss_price" numeric,
  "status" varchar(20) NOT NULL DEFAULT 'open',
  "first_seen_at" timestamp NOT NULL DEFAULT now(),
  "resolved_at" timestamp
);

CREATE INDEX IF NOT EXISTS "idx_macd_signal_log_status" ON "macd_signal_log" ("status");
CREATE INDEX IF NOT EXISTS "idx_macd_signal_log_symbol" ON "macd_signal_log" ("symbol");
