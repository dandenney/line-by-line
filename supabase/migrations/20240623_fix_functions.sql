-- Fix the ambiguous column reference in get_user_questions function
CREATE OR REPLACE FUNCTION get_user_questions(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  active_template_questions JSONB;
  user_default_questions JSONB;
BEGIN
  -- Try to get active template questions first
  SELECT questions INTO active_template_questions
  FROM question_templates
  WHERE user_id = user_uuid AND is_active = true
  LIMIT 1;
  
  -- If no active template, get default questions from settings
  IF active_template_questions IS NULL THEN
    SELECT us.default_questions INTO user_default_questions
    FROM user_settings us
    WHERE us.user_id = user_uuid;
    
    RETURN COALESCE(user_default_questions, '[
      "What did you learn today?",
      "What was most confusing or challenging today?", 
      "What did you learn about how you learn?"
    ]'::jsonb);
  END IF;
  
  RETURN active_template_questions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 