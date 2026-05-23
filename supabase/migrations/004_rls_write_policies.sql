-- =====================================================
-- RLS WRITE POLICIES MIGRATION
-- Run this in Supabase SQL Editor
-- Applied: 2026-03-24
-- =====================================================

-- -----------------------------------------------------
-- 1. FORM_CLASSES - Admin Write Policies
-- -----------------------------------------------------
DROP POLICY IF EXISTS "Admins can insert form_classes" ON public.form_classes;
DROP POLICY IF EXISTS "Admins can update form_classes" ON public.form_classes;
DROP POLICY IF EXISTS "Admins can delete form_classes" ON public.form_classes;

CREATE POLICY "Admins can insert form_classes" ON public.form_classes
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update form_classes" ON public.form_classes
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete form_classes" ON public.form_classes
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- -----------------------------------------------------
-- 2. KOKURIKULUM_UNITS - Admin Write Policies
-- -----------------------------------------------------
DROP POLICY IF EXISTS "Admins can insert kokurikulum_units" ON public.kokurikulum_units;
DROP POLICY IF EXISTS "Admins can update kokurikulum_units" ON public.kokurikulum_units;
DROP POLICY IF EXISTS "Admins can delete kokurikulum_units" ON public.kokurikulum_units;

CREATE POLICY "Admins can insert kokurikulum_units" ON public.kokurikulum_units
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update kokurikulum_units" ON public.kokurikulum_units
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete kokurikulum_units" ON public.kokurikulum_units
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- -----------------------------------------------------
-- 3. STUDENTS - Admin Write Policies
-- -----------------------------------------------------
DROP POLICY IF EXISTS "Admins can insert students" ON public.students;
DROP POLICY IF EXISTS "Admins can update students" ON public.students;
DROP POLICY IF EXISTS "Admins can delete students" ON public.students;

CREATE POLICY "Admins can insert students" ON public.students
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update students" ON public.students
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete students" ON public.students
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- -----------------------------------------------------
-- 4. MANAGEMENT_TEAM - Admin Write Policies
-- -----------------------------------------------------
DROP POLICY IF EXISTS "Admins can insert management_team" ON public.management_team;
DROP POLICY IF EXISTS "Admins can update management_team" ON public.management_team;
DROP POLICY IF EXISTS "Admins can delete management_team" ON public.management_team;

CREATE POLICY "Admins can insert management_team" ON public.management_team
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update management_team" ON public.management_team
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete management_team" ON public.management_team
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- -----------------------------------------------------
-- 5. USER_ROLES - Admin Write Policies
-- -----------------------------------------------------
DROP POLICY IF EXISTS "Admins can insert user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete user_roles" ON public.user_roles;

CREATE POLICY "Admins can insert user_roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update user_roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete user_roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- -----------------------------------------------------
-- 6. PENDING_ACCESS_REQUESTS - Admin Write Policies
-- -----------------------------------------------------
DROP POLICY IF EXISTS "Admins can insert pending_access_requests" ON public.pending_access_requests;
DROP POLICY IF EXISTS "Admins can update pending_access_requests" ON public.pending_access_requests;
DROP POLICY IF EXISTS "Admins can delete pending_access_requests" ON public.pending_access_requests;

CREATE POLICY "Admins can insert pending_access_requests" ON public.pending_access_requests
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update pending_access_requests" ON public.pending_access_requests
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete pending_access_requests" ON public.pending_access_requests
  FOR DELETE TO authenticated
  USING (public.is_admin());
