-- Add CSRF tokens table for Phase 6.3 CSRF protection
CREATE TABLE IF NOT EXISTS csrf_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_csrf_user ON csrf_tokens(user_id);
CREATE INDEX idx_csrf_token ON csrf_tokens(token);
CREATE INDEX idx_csrf_expires ON csrf_tokens(expires_at);
