-- View All Users with IDs and Roles
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq/sql/new

-- Complete user list with IDs
SELECT 
  u.id as user_id,
  u.email,
  p.full_name,
  COALESCE(ur.role::text, 'no role') as role,
  u.created_at,
  u.last_sign_in_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
ORDER BY u.created_at DESC;

-- Copy user ID for role change
-- Just copy the user_id from the results above

-- Change user to admin (replace USER_ID_HERE)
-- UPDATE user_roles 
-- SET role = 'admin'::app_role 
-- WHERE user_id = 'USER_ID_HERE';

-- Change user to regular user (replace USER_ID_HERE)
-- UPDATE user_roles 
-- SET role = 'user'::app_role 
-- WHERE user_id = 'USER_ID_HERE';

-- Or use email instead of ID:
-- UPDATE user_roles 
-- SET role = 'admin'::app_role 
-- WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com');
