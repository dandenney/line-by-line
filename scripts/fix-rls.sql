-- Fix RLS policies for entries table
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own entries" ON entries;
DROP POLICY IF EXISTS "Users can insert own entries" ON entries;
DROP POLICY IF EXISTS "Users can update own entries" ON entries;
DROP POLICY IF EXISTS "Users can delete own entries" ON entries;

-- Recreate policies with better conditions
CREATE POLICY "Users can view own entries" ON entries
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own entries" ON entries
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own entries" ON entries
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own entries" ON entries
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Also fix user_settings policies
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;

CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Ensure user settings exist for the current user
INSERT INTO user_settings (user_id, streak_days, default_questions)
SELECT 
  auth.uid(),
  '{1,2,3,4,5}',
  '["What did you learn today?", "What was most confusing or challenging today?", "What did you learn about how you learn?"]'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM user_settings WHERE user_id = auth.uid()
); 