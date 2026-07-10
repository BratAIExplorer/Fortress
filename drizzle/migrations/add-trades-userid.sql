-- Migration: Add userId to trades table for data isolation
-- Phase 6.1: Security fix - ensure trades are associated with user accounts
-- This migration adds user_id column and creates an index for data isolation

ALTER TABLE trades ADD COLUMN user_id VARCHAR(36) NOT NULL DEFAULT 'anonymous';

-- Create index for user_id queries
CREATE INDEX idx_trades_user ON trades(user_id);

-- Drop the default after adding to existing rows (if any)
ALTER TABLE trades ALTER COLUMN user_id DROP DEFAULT;

-- Note: For VPS deployment, run:
-- npx drizzle-kit push
