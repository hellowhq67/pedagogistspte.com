-- Add subscription tier enum
DO $$ BEGIN
  CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'premium');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add mock test status enum
DO $$ BEGIN
  CREATE TYPE mock_test_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Update users table to add subscription tier
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS mock_tests_taken INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_mock_test_at TIMESTAMP;

-- Create mock_tests table
CREATE TABLE IF NOT EXISTS mock_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_number INTEGER NOT NULL UNIQUE, -- 1-200
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT DEFAULT 'Medium', -- Easy, Medium, Hard
  duration INTEGER NOT NULL DEFAULT 120, -- in minutes (full test ~2 hours)
  total_questions INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT FALSE, -- Only first test is free
  status TEXT DEFAULT 'published',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create mock_test_questions table (links questions to mock tests)
CREATE TABLE IF NOT EXISTS mock_test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mock_test_id UUID NOT NULL REFERENCES mock_tests(id) ON DELETE CASCADE,
  question_id UUID NOT NULL, -- Can reference any question table
  question_type TEXT NOT NULL, -- speaking, writing, reading, listening
  section TEXT NOT NULL, -- Which section this belongs to
  order_index INTEGER NOT NULL,
  time_limit INTEGER, -- seconds for this specific question
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(mock_test_id, order_index)
);

-- Create mock_test_attempts table
CREATE TABLE IF NOT EXISTS mock_test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mock_test_id UUID NOT NULL REFERENCES mock_tests(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'in_progress', -- in_progress, completed, paused, abandoned
  current_question_index INTEGER DEFAULT 0,
  started_at TIMESTAMP DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP,
  paused_at TIMESTAMP,
  time_remaining INTEGER, -- seconds remaining
  -- Scores
  overall_score INTEGER,
  speaking_score INTEGER,
  writing_score INTEGER,
  reading_score INTEGER,
  listening_score INTEGER,
  -- Enabling Skills scores (like real PTE)
  grammar_score INTEGER,
  oral_fluency_score INTEGER,
  pronunciation_score INTEGER,
  spelling_score INTEGER,
  vocabulary_score INTEGER,
  written_discourse_score INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create mock_test_answers table
CREATE TABLE IF NOT EXISTS mock_test_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES mock_test_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL,
  question_type TEXT NOT NULL,
  user_response JSONB, -- Flexible storage for any answer type
  audio_url TEXT, -- For speaking responses
  is_scored BOOLEAN DEFAULT FALSE,
  scores JSONB, -- Detailed scoring breakdown
  ai_feedback TEXT,
  time_taken INTEGER, -- seconds
  submitted_at TIMESTAMP DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create AI credits usage log
CREATE TABLE IF NOT EXISTS ai_credit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL,
  credits_used INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create practice locks table (for free users)
CREATE TABLE IF NOT EXISTS practice_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  section TEXT NOT NULL, -- speaking, writing, reading, listening
  question_type TEXT NOT NULL,
  attempts_today INTEGER DEFAULT 0,
  last_attempt_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, section, question_type)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_mock_tests_is_free ON mock_tests(is_free);
CREATE INDEX IF NOT EXISTS idx_mock_tests_status ON mock_tests(status);
CREATE INDEX IF NOT EXISTS idx_mock_test_questions_mock_test_id ON mock_test_questions(mock_test_id);
CREATE INDEX IF NOT EXISTS idx_mock_test_attempts_user_id ON mock_test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_test_attempts_status ON mock_test_attempts(status);
CREATE INDEX IF NOT EXISTS idx_mock_test_answers_attempt_id ON mock_test_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_ai_credit_logs_user_created ON ai_credit_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_practice_locks_user_date ON practice_locks(user_id, last_attempt_date);
