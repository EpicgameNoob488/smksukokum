-- Add matched_teacher_name column to pending_access_requests
-- Run this in Supabase SQL Editor
-- Applied: 2026-03-24

ALTER TABLE pending_access_requests 
ADD COLUMN IF NOT EXISTS matched_teacher_name text;
