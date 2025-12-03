-- Make kilindosaid772@gmail.com an admin
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq/sql/new

-- Option 1: Change kilindosaid772@gmail.com to admin
UPDATE user_roles
SET role = 'admin'::app_role
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'kilindosaid772@gmail.com');

-- Option 2: Change kilindosaid771@gmail.com to admin
-- UPDATE user_roles
-- SET role = 'admin'::app_role
-- WHERE user_id = (SELECT id FROM auth.users WHERE email = 'kilindosaid771@gmail.com');

-- Verify the change
SELECT 
  u.email,
  ur.role::text as role,
  u.created_at
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email IN ('kilindosaid772@gmail.com', 'kilindosaid771@gmail.com')
ORDER BY u.created_at DESC;

-- Expected result: One should show 'admin', one should show 'user'
