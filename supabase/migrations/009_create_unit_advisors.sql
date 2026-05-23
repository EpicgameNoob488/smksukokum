-- =====================================================
-- CREATE UNIT_ADVISORS MAPPING TABLE
-- Run this in Supabase SQL Editor or via `supabase db push`
-- =====================================================

-- -----------------------------------------------------
-- 1. CREATE UNIT_ADVISORS TABLE
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.unit_advisors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  unit_code text NOT NULL,
  tahun int NOT NULL DEFAULT 2025,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, unit_code, tahun)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_unit_advisors_user_id ON public.unit_advisors(user_id);
CREATE INDEX IF NOT EXISTS idx_unit_advisors_unit_code ON public.unit_advisors(unit_code);
CREATE INDEX IF NOT EXISTS idx_unit_advisors_tahun ON public.unit_advisors(tahun);

-- Enable RLS
ALTER TABLE public.unit_advisors ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- 2. RLS POLICIES FOR UNIT_ADVISORS TABLE
-- -----------------------------------------------------

-- Users can read their own unit advisor assignments
CREATE POLICY "Users can read own unit advisor assignments" ON public.unit_advisors
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Admins can manage all unit advisor assignments
CREATE POLICY "Admins can manage all unit advisor assignments" ON public.unit_advisors
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Service role can manage all (for edge functions)
CREATE POLICY "Service role can manage all unit advisor assignments" ON public.unit_advisors
  FOR ALL TO service_role
  USING (true);
