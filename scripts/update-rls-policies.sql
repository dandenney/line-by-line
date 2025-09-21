-- Update RLS policies to remove NULL user_id checks since we now require auth

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own reflections" ON reflection_entries;
DROP POLICY IF EXISTS "Users can insert own reflections" ON reflection_entries;
DROP POLICY IF EXISTS "Users can update own reflections" ON reflection_entries;
DROP POLICY IF EXISTS "Users can delete own reflections" ON reflection_entries;

DROP POLICY IF EXISTS "Users can view own prompts" ON writing_prompts;
DROP POLICY IF EXISTS "Users can insert own prompts" ON writing_prompts;
DROP POLICY IF EXISTS "Users can update own prompts" ON writing_prompts;
DROP POLICY IF EXISTS "Users can delete own prompts" ON writing_prompts;

-- Create new policies that require authentication
CREATE POLICY "Users can view own reflections" ON reflection_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections" ON reflection_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections" ON reflection_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reflections" ON reflection_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Create new policies for writing_prompts that require authentication
CREATE POLICY "Users can view own prompts" ON writing_prompts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prompts" ON writing_prompts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prompts" ON writing_prompts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prompts" ON writing_prompts
  FOR DELETE USING (auth.uid() = user_id);

-- Update user_id columns to be NOT NULL since we now require auth
ALTER TABLE reflection_entries ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE writing_prompts ALTER COLUMN user_id SET NOT NULL;