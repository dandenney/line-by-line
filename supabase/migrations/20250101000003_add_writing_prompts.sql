-- Create writing_prompts table
CREATE TABLE IF NOT EXISTS writing_prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  prompt_text TEXT NOT NULL,
  source_entry_date DATE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_writing_prompts_user_id ON writing_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_writing_prompts_entry_id ON writing_prompts(entry_id);
CREATE INDEX IF NOT EXISTS idx_writing_prompts_is_used ON writing_prompts(is_used);

-- Enable RLS
ALTER TABLE writing_prompts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own writing prompts" ON writing_prompts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own writing prompts" ON writing_prompts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own writing prompts" ON writing_prompts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own writing prompts" ON writing_prompts
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_writing_prompts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_writing_prompts_updated_at
  BEFORE UPDATE ON writing_prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_writing_prompts_updated_at(); 