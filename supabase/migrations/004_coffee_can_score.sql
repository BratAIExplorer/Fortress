-- Migration: Coffee Can Score fields on scan_results
-- Apply with: psql "$DATABASE_URL" -f supabase/migrations/004_coffee_can_score.sql
-- Safe to run multiple times (idempotent DO block)

DO $$
BEGIN
  -- Coffee Can Score (0-100)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='scan_results' AND column_name='cc_score') THEN
    ALTER TABLE scan_results ADD COLUMN cc_score integer;
  END IF;

  -- Coffee Can Tier (Classic/Strong/Developing/Inconsistent)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='scan_results' AND column_name='cc_tier') THEN
    ALTER TABLE scan_results ADD COLUMN cc_tier text;
  END IF;

  -- 4yr Revenue CAGR as percentage
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='scan_results' AND column_name='cc_revenue_cagr') THEN
    ALTER TABLE scan_results ADD COLUMN cc_revenue_cagr numeric;
  END IF;

  -- Number of years of data checked (max 4)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='scan_results' AND column_name='cc_years_checked') THEN
    ALTER TABLE scan_results ADD COLUMN cc_years_checked integer;
  END IF;
END $$;

-- Index for Coffee Can filtering (Classic/Strong candidates)
CREATE INDEX IF NOT EXISTS idx_scan_results_cc_score
  ON scan_results (scan_id, cc_score DESC NULLS LAST);
