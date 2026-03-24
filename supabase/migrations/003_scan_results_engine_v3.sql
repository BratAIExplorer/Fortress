-- Migration: Engine v3 fields on scan_results
-- Apply with: psql $DATABASE_URL -f supabase/migrations/003_scan_results_engine_v3.sql
-- Safe to run multiple times (uses IF NOT EXISTS pattern via DO block)

DO $$
BEGIN
  -- Multi-Bagger Score (0-100)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='scan_results' AND column_name='mb_score') THEN
    ALTER TABLE scan_results ADD COLUMN mb_score integer;
  END IF;

  -- Multi-Bagger Tier (Rocket/Launcher/Builder/Crawler/Grounded)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='scan_results' AND column_name='mb_tier') THEN
    ALTER TABLE scan_results ADD COLUMN mb_tier text;
  END IF;

  -- Megatrend tag (e.g. "Defence & Aerospace")
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='scan_results' AND column_name='megatrend_tag') THEN
    ALTER TABLE scan_results ADD COLUMN megatrend_tag text;
  END IF;

  -- Megatrend emoji (e.g. "🛡️")
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='scan_results' AND column_name='megatrend_emoji') THEN
    ALTER TABLE scan_results ADD COLUMN megatrend_emoji text;
  END IF;

  -- FCF Yield % (freeCashflow ÷ marketCap × 100)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='scan_results' AND column_name='fcf_yield_pct') THEN
    ALTER TABLE scan_results ADD COLUMN fcf_yield_pct numeric;
  END IF;

  -- Earnings Quality (FCF ÷ netIncome; > 0.8 = clean, < 0.5 = red flag)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='scan_results' AND column_name='earnings_quality') THEN
    ALTER TABLE scan_results ADD COLUMN earnings_quality numeric;
  END IF;

  -- PEG Ratio (trailingPE ÷ earningsGrowth%; < 1.0 = growth underpriced)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='scan_results' AND column_name='peg_ratio') THEN
    ALTER TABLE scan_results ADD COLUMN peg_ratio numeric;
  END IF;

  -- Debt trajectory direction (falling/stable/rising/unknown)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='scan_results' AND column_name='de_direction') THEN
    ALTER TABLE scan_results ADD COLUMN de_direction text;
  END IF;

  -- Operating margin direction (expanding/stable/contracting/unknown)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='scan_results' AND column_name='margin_direction') THEN
    ALTER TABLE scan_results ADD COLUMN margin_direction text;
  END IF;
END $$;

-- Index for fast MB score sorting (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_scan_results_mb_score
  ON scan_results (scan_id, mb_score DESC NULLS LAST);

-- Index for megatrend filtering
CREATE INDEX IF NOT EXISTS idx_scan_results_megatrend
  ON scan_results (scan_id, megatrend_tag);
