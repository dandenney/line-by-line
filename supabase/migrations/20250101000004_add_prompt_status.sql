-- Add status column to writing_prompts table
ALTER TABLE writing_prompts 
ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'written', 'archived'));

-- Update existing is_used records to use the new status field
UPDATE writing_prompts 
SET status = CASE 
  WHEN is_used = true THEN 'written'
  ELSE 'active'
END;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_writing_prompts_status ON writing_prompts(status);

-- Drop the old is_used column (optional - we can keep it for backward compatibility)
-- ALTER TABLE writing_prompts DROP COLUMN is_used; 