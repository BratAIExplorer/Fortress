-- Migration: Add bot_user_actions table for tracking user decisions on signals
-- Date: 2026-07-29
-- Purpose: Enable feedback loop for AI learning and performance tracking

CREATE TABLE IF NOT EXISTS bot_user_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    timeframe VARCHAR(10) NOT NULL,
    action VARCHAR(20) NOT NULL,
    quantity INTEGER,
    entry_price NUMERIC,
    exit_price NUMERIC,
    outcome VARCHAR(20),
    pnl NUMERIC,
    notes VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_bot_actions_user ON bot_user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_actions_symbol ON bot_user_actions(symbol);
CREATE INDEX IF NOT EXISTS idx_bot_actions_action ON bot_user_actions(action);
CREATE INDEX IF NOT EXISTS idx_bot_actions_created ON bot_user_actions(created_at);
