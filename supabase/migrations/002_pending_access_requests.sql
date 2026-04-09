-- =====================================================
-- PENDING ACCESS REQUESTS MIGRATION
-- Run this in Supabase SQL Editor
-- =====================================================

-- -----------------------------------------------------
-- 1. CREATE PENDING_ACCESS_REQUESTS TABLE
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pending_access_requests (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  full_name text not null,
  request_type text not null check (request_type in ('teacher', 'admin')) default 'teacher',
  status text not null check (status in ('pending', 'approved', 'rejected')) default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  notes text
);

-- Enable RLS
ALTER TABLE public.pending_access_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can create request" ON public.pending_access_requests
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can read own request" ON public.pending_access_requests
  FOR SELECT TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage all requests" ON public.pending_access_requests
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- -----------------------------------------------------
-- 2. INDEXES
-- -----------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_pending_requests_email ON public.pending_access_requests(email);
CREATE INDEX IF NOT EXISTS idx_pending_requests_status ON public.pending_access_requests(status);
