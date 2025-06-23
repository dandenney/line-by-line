-- Test RLS policies directly
-- Run this in your Supabase SQL editor

-- First, let's see what the current user context is
SELECT auth.uid() as current_user_id;

-- Test the entries table RLS policy
-- This should show the entry if RLS is working
SELECT * FROM entries WHERE user_id = '31468134-9f21-428d-9a14-4dea20c95317';

-- Test with explicit auth.uid() comparison
SELECT * FROM entries WHERE user_id = auth.uid();

-- Check if the user exists in auth.users
SELECT id, email FROM auth.users WHERE id = '31468134-9f21-428d-9a14-4dea20c95317';

-- Test the RLS policy condition manually
SELECT 
  '31468134-9f21-428d-9a14-4dea20c95317' as user_id,
  auth.uid() as auth_uid,
  ('31468134-9f21-428d-9a14-4dea20c95317' = auth.uid()) as policy_check;

-- Check RLS policies on entries table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'entries'; 