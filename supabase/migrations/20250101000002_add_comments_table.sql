-- Migration: 20250101000001_add_comments_table.sql
-- Description: Add comments table for entries
-- Run this in Supabase SQL Editor

-- Create comments table
CREATE TABLE entry_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id UUID REFERENCES entries(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_entry_comments_entry_id ON entry_comments(entry_id);
CREATE INDEX idx_entry_comments_user_id ON entry_comments(user_id);
CREATE INDEX idx_entry_comments_created_at ON entry_comments(created_at DESC);

-- Enable Row Level Security
ALTER TABLE entry_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for entry_comments table
CREATE POLICY "Users can view comments on their own entries" ON entry_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM entries 
      WHERE entries.id = entry_comments.entry_id 
      AND entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert comments on their own entries" ON entry_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM entries 
      WHERE entries.id = entry_comments.entry_id 
      AND entries.user_id = auth.uid()
    ) AND auth.uid() = user_id
  );

CREATE POLICY "Users can update their own comments" ON entry_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON entry_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to update updated_at column
CREATE TRIGGER update_entry_comments_updated_at
  BEFORE UPDATE ON entry_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 