-- Migration: Market Pulse macro snapshots table
-- Apply with: psql "$DATABASE_URL" -f supabase/migrations/005_macro_snapshots.sql
-- Safe to run multiple times (idempotent)

CREATE TABLE IF NOT EXISTS macro_snapshots (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_date date NOT NULL UNIQUE,
    nifty_50    numeric,
    bank_nifty  numeric,
    usd_inr     numeric,
    gold_usd    numeric,
    crude_oil_usd numeric,
    us_10y_yield  numeric,
    cboe_vix    numeric,
    india_vix   numeric,
    fetched_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_macro_snapshots_date
    ON macro_snapshots (snapshot_date DESC);
