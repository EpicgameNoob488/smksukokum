-- =====================================================
-- ADD USER_ID TO PENDING ACCESS REQUESTS
-- Run this in Supabase SQL Editor
-- =====================================================

ALTER TABLE public.pending_access_requests
ADD COLUMN IF NOT EXISTS user_id uuid references auth.users(id);