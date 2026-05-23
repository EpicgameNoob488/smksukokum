-- =====================================================
-- FIX: Re-link existing teachers to 2026 form classes
-- Run this in Supabase SQL Editor
-- =====================================================

-- STEP 1: Check current approved requests
-- Look for Chok Vui Ni or any teacher that needs re-linking
SELECT id, full_name, email, status, reviewed_at, matched_teacher_name
FROM pending_access_requests
WHERE status = 'approved'
ORDER BY reviewed_at DESC;

-- STEP 2: Check current user roles (see who is linked to which form class)
-- This shows the current assignments
SELECT
  ur.user_id,
  ur.role,
  ur.form_class_id,
  fc.nama_kelas as form_class_name,
  fc.tahun as form_class_year,
  au.email
FROM user_roles ur
LEFT JOIN form_classes fc ON ur.form_class_id = fc.id::uuid
JOIN auth.users au ON ur.user_id = au.id;

-- STEP 3: Delete old pending requests for specific teacher (if they exist)
-- Run this only if you want the teacher to re-register
-- DELETE FROM pending_access_requests
-- WHERE full_name ILIKE '%Chok Vui Ni%'
-- AND status = 'approved';

-- STEP 4: Update form_class_id to NULL for teachers who were linked to wrong year
-- This will let them re-register and get proper 2026 linking
-- UPDATE user_roles
-- SET form_class_id = NULL
-- WHERE user_id = (SELECT id FROM auth.users WHERE email = '2@gmail.com');