-- Line by Line Database Schema Migration
-- This creates the schema for storing reflections and writing prompts

-- Create reflection_entries table
CREATE TABLE IF NOT EXISTS reflection_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initial_reflection TEXT NOT NULL,
  conversation_messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  prompts JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create writing_prompts table
CREATE TABLE IF NOT EXISTS writing_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  type VARCHAR(20) CHECK (type IN ('blog', 'social', 'internal')) DEFAULT 'internal',
  saved BOOLEAN DEFAULT false,
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reflection_entry_id UUID REFERENCES reflection_entries(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE reflection_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_prompts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own reflections" ON reflection_entries;
DROP POLICY IF EXISTS "Users can insert own reflections" ON reflection_entries;
DROP POLICY IF EXISTS "Users can update own reflections" ON reflection_entries;
DROP POLICY IF EXISTS "Users can delete own reflections" ON reflection_entries;

DROP POLICY IF EXISTS "Users can view own prompts" ON writing_prompts;
DROP POLICY IF EXISTS "Users can insert own prompts" ON writing_prompts;
DROP POLICY IF EXISTS "Users can update own prompts" ON writing_prompts;
DROP POLICY IF EXISTS "Users can delete own prompts" ON writing_prompts;

-- Create RLS policies for reflection_entries
CREATE POLICY "Users can view own reflections" ON reflection_entries
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own reflections" ON reflection_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own reflections" ON reflection_entries
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own reflections" ON reflection_entries
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Create RLS policies for writing_prompts
CREATE POLICY "Users can view own prompts" ON writing_prompts
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own prompts" ON writing_prompts
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own prompts" ON writing_prompts
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own prompts" ON writing_prompts
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reflection_entries_user_id ON reflection_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_reflection_entries_created_at ON reflection_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_writing_prompts_user_id ON writing_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_writing_prompts_saved ON writing_prompts(saved) WHERE saved = true;
CREATE INDEX IF NOT EXISTS idx_writing_prompts_reflection_id ON writing_prompts(reflection_entry_id);