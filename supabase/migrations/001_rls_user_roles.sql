-- =====================================================
-- RLS & USER ROLES MIGRATION
-- Run this in Supabase SQL Editor
-- =====================================================

-- -----------------------------------------------------
-- 1. CREATE USER_ROLES TABLE
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  role text not null check (role in ('admin', 'teacher')) default 'teacher',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policies for user_roles table
CREATE POLICY "Users can read own role" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Service role can manage all roles" ON public.user_roles
  FOR ALL TO service_role
  USING (true);

-- -----------------------------------------------------
-- 2. CREATE HELPER FUNCTIONS
-- -----------------------------------------------------

-- Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin');
$$;

-- Check if user is teacher
CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'teacher');
$$;

-- Get current user's role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid();
$$;

-- -----------------------------------------------------
-- 3. RLS POLICIES FOR FORM_CLASSES TABLE
-- -----------------------------------------------------
ALTER TABLE public.form_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access form_classes" ON public.form_classes
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Authenticated read form_classes" ON public.form_classes
  FOR SELECT TO authenticated
  USING (true);

-- -----------------------------------------------------
-- 4. RLS POLICIES FOR KOKURIKULUM_UNITS TABLE
-- -----------------------------------------------------
ALTER TABLE public.kokurikulum_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access kokurikulum_units" ON public.kokurikulum_units
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Authenticated read kokurikulum_units" ON public.kokurikulum_units
  FOR SELECT TO authenticated
  USING (true);

-- -----------------------------------------------------
-- 5. RLS POLICIES FOR STUDENTS TABLE
-- -----------------------------------------------------
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access students" ON public.students
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Authenticated read students" ON public.students
  FOR SELECT TO authenticated
  USING (true);

-- -----------------------------------------------------
-- 6. RLS POLICIES FOR MANAGEMENT_TEAM TABLE
-- -----------------------------------------------------
ALTER TABLE public.management_team ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access management_team" ON public.management_team
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Authenticated read management_team" ON public.management_team
  FOR SELECT TO authenticated
  USING (true);

-- -----------------------------------------------------
-- 7. SEED ADMIN USER (Optional - for first admin)
-- -----------------------------------------------------
-- Uncomment and run manually for your admin account:
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'admin' FROM auth.users WHERE email = 'your-admin@email.com'
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- -----------------------------------------------------
-- 8. FUNCTION TO AUTO-CREATE ROLE ON SIGNUP
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'role', 'teacher'))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------
-- 9. INDEXES FOR PERFORMANCE
-- -----------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_form_classes_teacher ON public.form_classes(teacher_name);
CREATE INDEX IF NOT EXISTS idx_students_class ON public.students(kelas);
