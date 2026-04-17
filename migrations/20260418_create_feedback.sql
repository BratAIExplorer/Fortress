CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User info
  user_id UUID NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  
  -- Feedback content
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  
  -- Context
  page_url VARCHAR(512),
  stock_ticker VARCHAR(10),
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'new',
  internal_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  
  -- Constraints
  CONSTRAINT valid_type CHECK (type IN ('bug', 'suggestion', 'validation', 'question')),
  CONSTRAINT valid_status CHECK (status IN ('new', 'in_review', 'actioned', 'archived')),
  FOREIGN KEY (user_id) REFERENCES auth_user(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX idx_feedback_type ON feedback(type);
