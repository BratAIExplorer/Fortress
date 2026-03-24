-- Migration: Add market column to scans and scan_results tables
-- This column was in the schema but missing a DB migration.
-- Apply with: psql "$DATABASE_URL" -f supabase/migrations/002b_scans_market_column.sql
-- Safe to run multiple times (idempotent IF NOT EXISTS)

ALTER TABLE scans
    ADD COLUMN IF NOT EXISTS market text NOT NULL DEFAULT 'NSE';

ALTER TABLE scan_results
    ADD COLUMN IF NOT EXISTS market text NOT NULL DEFAULT 'NSE';
