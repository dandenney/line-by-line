-- Migration: Add question set selection to user settings
-- Description: Allow users to choose between different question templates

-- Add active_template_id to user_settings
ALTER TABLE user_settings 
ADD COLUMN active_template_id UUID REFERENCES question_templates(id);

-- Create predefined question templates (system templates)
-- These will be available to all users

-- Learning-focused template (current default)
INSERT INTO question_templates (id, user_id, name, questions, is_active) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000', -- System user
  'Learning Reflection',
  ARRAY[
    'What did you learn today?',
    'What was most confusing or challenging today?',
    'What did you learn about how you learn?'
  ],
  true
);

-- Standup template (placeholder - you can update the questions)
INSERT INTO question_templates (id, user_id, name, questions, is_active) 
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000', -- System user
  'Daily Standup',
  ARRAY[
    'What slowed you down today, and how might someone else avoid it?',
    'Did something about your tools, stack, or workflow spark a rant or love letter?',
    "If today's lesson were a tweet-sized note to your past self, what would it say?"
  ],
  true
);

-- Update RLS policies to allow reading system templates
CREATE POLICY "Users can view system question templates" ON question_templates
  FOR SELECT USING (user_id = '00000000-0000-0000-0000-000000000000' OR auth.uid() = user_id);

-- Function to get available question templates for a user
CREATE OR REPLACE FUNCTION get_available_templates(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
  id UUID,
  name TEXT,
  questions TEXT[],
  is_system BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    qt.id,
    qt.name,
    qt.questions,
    (qt.user_id = '00000000-0000-0000-0000-000000000000'::UUID) as is_system
  FROM question_templates qt
  WHERE qt.is_active = true 
    AND (qt.user_id = user_uuid OR qt.user_id = '00000000-0000-0000-0000-000000000000'::UUID)
  ORDER BY qt.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's active template questions
CREATE OR REPLACE FUNCTION get_user_questions(user_uuid UUID DEFAULT auth.uid())
RETURNS TEXT[] AS $$
DECLARE
  template_questions TEXT[];
  active_template_id UUID;
BEGIN
  -- Get user's active template
  SELECT us.active_template_id INTO active_template_id
  FROM user_settings us
  WHERE us.user_id = user_uuid;
  
  -- If no active template set, use the learning template as default
  IF active_template_id IS NULL THEN
    active_template_id := '00000000-0000-0000-0000-000000000001';
  END IF;
  
  -- Get questions from the template
  SELECT qt.questions INTO template_questions
  FROM question_templates qt
  WHERE qt.id = active_template_id AND qt.is_active = true;
  
  -- If template not found, return default learning questions
  IF template_questions IS NULL THEN
    template_questions := ARRAY[
      'What did you learn today?',
      'What was most confusing or challenging today?',
      'What did you learn about how you learn?'
    ];
  END IF;
  
  RETURN template_questions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;