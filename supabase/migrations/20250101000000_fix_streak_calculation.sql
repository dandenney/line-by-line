-- Fix streak calculation to start from most recent entry instead of today
-- This ensures the streak counts consecutive days from the last entry backwards

CREATE OR REPLACE FUNCTION calculate_user_streak(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  current_streak INTEGER := 0;
  check_date DATE;
  user_streak_days INTEGER[];
  last_entry_date DATE;
BEGIN
  -- Get user's streak days preference
  SELECT streak_days INTO user_streak_days 
  FROM user_settings 
  WHERE user_id = user_uuid;
  
  -- Default to weekdays if no settings found
  IF user_streak_days IS NULL THEN
    user_streak_days := '{1,2,3,4,5}';
  END IF;
  
  -- Get the most recent entry date for this user
  SELECT MAX(entry_date) INTO last_entry_date
  FROM entries 
  WHERE user_id = user_uuid;
  
  -- If no entries exist, return 0
  IF last_entry_date IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Start checking from the most recent entry date
  check_date := last_entry_date;
  
  -- Calculate current streak
  WHILE TRUE LOOP
    -- Check if this date should have an entry (is a streak day)
    IF EXTRACT(DOW FROM check_date) = ANY(user_streak_days) THEN
      -- Check if entry exists for this date
      IF EXISTS (
        SELECT 1 FROM entries 
        WHERE user_id = user_uuid 
        AND entry_date = check_date
      ) THEN
        current_streak := current_streak + 1;
        check_date := check_date - INTERVAL '1 day';
      ELSE
        EXIT;
      END IF;
    ELSE
      -- Not a streak day, move to previous day
      check_date := check_date - INTERVAL '1 day';
    END IF;
  END LOOP;
  
  RETURN current_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 