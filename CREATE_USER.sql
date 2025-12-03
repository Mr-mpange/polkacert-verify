-- Script to create a regular user (not admin) in Supabase
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq/sql

-- Step 1: First, create the user in Supabase Dashboard Authentication
-- Go to: Authentication > Users > Add User
-- Email: user@example.com
-- Password: (set a password)
-- After creating, copy the user's UUID

-- Step 2: Then run this SQL to assign the 'user' role
-- Replace 'USER_UUID_HERE' with the actual UUID from step 1

-- Example:
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('12345678-1234-1234-1234-123456789abc', 'user');

-- Or if you want to create multiple users at once:
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES 
--   ('user-uuid-1', 'user'),
--   ('user-uuid-2', 'user'),
--   ('user-uuid-3', 'user');

-- To verify the user was created with correct role:
-- SELECT u.email, ur.role 
-- FROM auth.users u
-- LEFT JOIN public.user_roles ur ON u.id = ur.user_id
-- WHERE u.email = 'user@example.com';

-- To check all users and their roles:
-- SELECT u.email, ur.role, u.created_at
-- FROM auth.users u
-- LEFT JOIN public.user_roles ur ON u.id = ur.user_id
-- ORDER BY u.created_at DESC;
