-- Apply RLS policies for entries table
-- Enable RLS if not already enabled
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own entries" ON entries;
DROP POLICY IF EXISTS "Users can insert own entries" ON entries;
DROP POLICY IF EXISTS "Users can update own entries" ON entries;
DROP POLICY IF EXISTS "Users can delete own entries" ON entries;

-- Create RLS policies for entries table
CREATE POLICY "Users can view own entries" ON entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries" ON entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries" ON entries
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries" ON entries
  FOR DELETE USING (auth.uid() = user_id);

-- Also apply to other tables if they exist
DO $$
BEGIN
  -- user_settings table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_settings') THEN
    ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
    DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
    DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
    
    CREATE POLICY "Users can view own settings" ON user_settings
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert own settings" ON user_settings
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update own settings" ON user_settings
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  -- question_templates table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'question_templates') THEN
    ALTER TABLE question_templates ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view own templates" ON question_templates;
    DROP POLICY IF EXISTS "Users can insert own templates" ON question_templates;
    DROP POLICY IF EXISTS "Users can update own templates" ON question_templates;
    DROP POLICY IF EXISTS "Users can delete own templates" ON question_templates;
    
    CREATE POLICY "Users can view own templates" ON question_templates
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert own templates" ON question_templates
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update own templates" ON question_templates
      FOR UPDATE USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can delete own templates" ON question_templates
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
  
  -- streak_analytics table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'streak_analytics') THEN
    ALTER TABLE streak_analytics ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view own analytics" ON streak_analytics;
    DROP POLICY IF EXISTS "Users can insert own analytics" ON streak_analytics;
    DROP POLICY IF EXISTS "Users can update own analytics" ON streak_analytics;
    
    CREATE POLICY "Users can view own analytics" ON streak_analytics
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert own analytics" ON streak_analytics
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update own analytics" ON streak_analytics
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$; 