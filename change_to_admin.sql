-- Change User Role to Admin
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq/sql/new

-- ⚠️ CHANGE THE EMAIL BELOW to the user you want to make admin
-- Method 1: Update existing role
UPDATE public.user_roles
SET role = 'admin'::app_role
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com');

-- Method 2: Insert if no role exists (safer)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role 
FROM auth.users 
WHERE email = 'user@example.com'
ON CONFLICT (user_id, role) 
DO UPDATE SET role = 'admin'::app_role;

-- Verify the change
SELECT 
  u.email,
  ur.role::text as role,
  u.created_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'user@example.com';

-- Expected result: role should show 'admin'
