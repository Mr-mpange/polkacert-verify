# Change User Role to Admin

## Quick Method: Supabase Dashboard

### Step 1: Go to SQL Editor
https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq/sql/new

### Step 2: Run This SQL

Replace `user@example.com` with the actual user's email:

```sql
-- Change user to admin
UPDATE public.user_roles
SET role = 'admin'::app_role
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com');
```

### Step 3: Verify

```sql
-- Check the user's role
SELECT u.email, ur.role::text as role
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'user@example.com';
```

You should see: `role: admin`

### Step 4: Test
1. Logout from the app
2. Login with that user's credentials
3. Should redirect to `/admin` dashboard (not `/dashboard`)

---

## If User Has No Role Yet

If the user doesn't have any role assigned:

```sql
-- Add admin role to user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role 
FROM auth.users 
WHERE email = 'user@example.com'
ON CONFLICT (user_id, role) DO UPDATE
SET role = 'admin'::app_role;
```

---

## Change Multiple Users to Admin

```sql
-- Make multiple users admin
UPDATE public.user_roles
SET role = 'admin'::app_role
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN (
    'user1@example.com',
    'user2@example.com',
    'user3@example.com'
  )
);
```

---

## Change Admin Back to User

```sql
-- Demote admin to regular user
UPDATE public.user_roles
SET role = 'user'::app_role
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');
```

---

## View All Users and Their Roles

```sql
-- See all users with their roles
SELECT 
  u.email,
  COALESCE(ur.role::text, 'no role') as role,
  u.created_at,
  u.last_sign_in_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
ORDER BY u.created_at DESC;
```

---

## Using User UUID Instead of Email

If you know the user's UUID:

```sql
-- Change by UUID
UPDATE public.user_roles
SET role = 'admin'::app_role
WHERE user_id = '12345678-1234-1234-1234-123456789abc';
```

To find a user's UUID:

```sql
-- Get user UUID by email
SELECT id, email FROM auth.users WHERE email = 'user@example.com';
```

---

## Quick Links

- **SQL Editor**: https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq/sql/new
- **View Users**: https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq/auth/users
- **Test Login**: http://localhost:8082/auth

---

## Troubleshooting

### User still redirected to /dashboard
- Clear browser cache and cookies
- Logout and login again
- Check role was actually updated (run verify query)

### "No rows updated"
- User doesn't exist in user_roles table
- Use INSERT query instead of UPDATE
- Check email spelling

### User can't access admin features
- Make sure role is 'admin' not 'Admin' (lowercase)
- Check RLS policies are working
- Verify with the SELECT query

---

## Example: Make Your Current User Admin

1. Find your email in the app (top right when logged in)
2. Go to SQL Editor
3. Run:
```sql
UPDATE public.user_roles
SET role = 'admin'::app_role
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL_HERE');
```
4. Logout and login again
5. You should now see the Admin Dashboard!
