-- Migration: 20250101000005_add_rate_limiting.sql
-- Description: Add rate limiting table for API usage tracking
-- Run this in Supabase SQL Editor

-- Create rate limiting table
CREATE TABLE api_rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL,
  request_date DATE NOT NULL,
  request_count INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Ensure one record per user per endpoint per day
  UNIQUE(user_id, endpoint, request_date)
);

-- Create indexes for better performance
CREATE INDEX idx_api_rate_limits_user_endpoint ON api_rate_limits(user_id, endpoint);
CREATE INDEX idx_api_rate_limits_date ON api_rate_limits(request_date);

-- Enable RLS
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own rate limit records" ON api_rate_limits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rate limit records" ON api_rate_limits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rate limit records" ON api_rate_limits
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_api_rate_limits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_api_rate_limits_updated_at
  BEFORE UPDATE ON api_rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_api_rate_limits_updated_at();

-- Function to check and increment rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  user_uuid UUID,
  endpoint_name TEXT,
  max_requests INTEGER DEFAULT 3
)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  today_date DATE := CURRENT_DATE;
BEGIN
  -- Get current count for today
  SELECT COALESCE(request_count, 0) INTO current_count
  FROM api_rate_limits
  WHERE user_id = user_uuid 
    AND endpoint = endpoint_name 
    AND request_date = today_date;
  
  -- If no record exists, create one
  IF current_count IS NULL THEN
    INSERT INTO api_rate_limits (user_id, endpoint, request_date, request_count)
    VALUES (user_uuid, endpoint_name, today_date, 1);
    RETURN TRUE;
  END IF;
  
  -- Check if under limit
  IF current_count >= max_requests THEN
    RETURN FALSE;
  END IF;
  
  -- Increment count
  UPDATE api_rate_limits 
  SET request_count = request_count + 1
  WHERE user_id = user_uuid 
    AND endpoint = endpoint_name 
    AND request_date = today_date;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current rate limit status
CREATE OR REPLACE FUNCTION get_rate_limit_status(
  user_uuid UUID,
  endpoint_name TEXT,
  max_requests INTEGER DEFAULT 3
)
RETURNS JSONB AS $$
DECLARE
  current_count INTEGER;
  today_date DATE := CURRENT_DATE;
BEGIN
  -- Get current count for today
  SELECT COALESCE(request_count, 0) INTO current_count
  FROM api_rate_limits
  WHERE user_id = user_uuid 
    AND endpoint = endpoint_name 
    AND request_date = today_date;
  
  RETURN jsonb_build_object(
    'current_count', current_count,
    'max_requests', max_requests,
    'remaining', GREATEST(0, max_requests - current_count),
    'is_allowed', current_count < max_requests
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 