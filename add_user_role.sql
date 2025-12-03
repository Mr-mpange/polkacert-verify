-- Add Regular User Role using Supabase CLI
-- 
-- USAGE:
-- 1. First create user in Supabase Dashboard: 
--    https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq/auth/users
--    - Click "Add user"
--    - Email: user@example.com
--    - Password: (your choice)
--    - Check "Auto Confirm User"
--
-- 2. Then run this file with Supabase CLI:
--    supabase db execute --project-ref plwqxhsbupsahfujmyhq -f add_user_role.sql
--
-- Or replace the email below and run directly:
-- supabase db execute --project-ref plwqxhsbupsahfujmyhq "INSERT INTO public.user_roles (user_id, role) SELECT id, 'user'::app_role FROM auth.users WHERE email = 'user@example.com';"

-- Assign 'user' role to the user
-- CHANGE THE EMAIL BELOW to match your user's email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user'::app_role 
FROM auth.users 
WHERE email = 'user@example.com'  -- ⚠️ CHANGE THIS EMAIL
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify the user was created with correct role
SELECT 
    u.email, 
    ur.role::text as role,
    u.created_at,
    u.confirmed_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'user@example.com'  -- ⚠️ CHANGE THIS EMAIL
ORDER BY u.created_at DESC;
