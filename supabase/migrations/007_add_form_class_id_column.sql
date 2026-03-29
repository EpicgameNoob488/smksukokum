-- =====================================================
-- ADD FORM_CLASS_ID TO USER_ROLES
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add form_class_id column to user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS form_class_id uuid REFERENCES public.form_classes(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_form_class_id ON public.user_roles(form_class_id);