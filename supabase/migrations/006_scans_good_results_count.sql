-- Migration 006: Add good_results_count to scans table
-- Tracks the number of non-OFFLINE results per scan so the quality gate
-- can use a single column read instead of a COUNT(*) query on scan_results.

ALTER TABLE scans ADD COLUMN IF NOT EXISTS good_results_count integer;
