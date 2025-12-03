# Create User WITHOUT Supabase CLI

## Simple 2-Step Process (No CLI Required)

### Step 1: Create User in Dashboard

1. Open: https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq/auth/users

2. Click **"Add user"** button (top right)

3. Fill in:
   - **Email**: `user@example.com`
   - **Password**: `YourPassword123`
   - ✅ **Auto Confirm User**: Check this box
   
4. Click **"Create user"**

5. ✅ User created!

### Step 2: Assign 'user' Role

1. Open SQL Editor: https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq/sql/new

2. Paste this SQL (change the email to match your user):

```sql
-- Assign 'user' role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user'::app_role 
FROM auth.users 
WHERE email = 'user@example.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify it worked
SELECT 
    u.email, 
    ur.role::text as role,
    u.created_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'user@example.com';
```

3. Click **"Run"** (or press Ctrl+Enter)

4. You should see the user with role 'user' in the results

### Step 3: Test Login

1. Go to: http://localhost:8082/auth

2. Login with:
   - Email: `user@example.com`
   - Password: `YourPassword123`

3. ✅ Should redirect to `/dashboard` (not `/admin`)

---

## Create Multiple Users

### In Dashboard:
Create each user one by one in Authentication > Users

### In SQL Editor:
Assign roles to all at once:

```sql
-- Assign 'user' role to multiple users
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user'::app_role 
FROM auth.users 
WHERE email IN (
    'user1@example.com',
    'user2@example.com',
    'user3@example.com'
)
ON CONFLICT (user_id, role) DO NOTHING;
```

---

## Create Admin User

Same process, but use 'admin' role:

```sql
-- Assign 'admin' role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role 
FROM auth.users 
WHERE email = 'admin@example.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

---

## Useful SQL Queries

### View all users and their roles:
```sql
SELECT 
    u.email, 
    COALESCE(ur.role::text, 'no role') as role,
    u.created_at,
    u.confirmed_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
ORDER BY u.created_at DESC;
```

### Change user to admin:
```sql
UPDATE public.user_roles
SET role = 'admin'::app_role
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com');
```

### Change admin to user:
```sql
UPDATE public.user_roles
SET role = 'user'::app_role
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');
```

### Delete user role:
```sql
DELETE FROM public.user_roles
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com');
```

### Delete user completely:
```sql
-- This will also delete their role (cascade)
DELETE FROM auth.users
WHERE email = 'user@example.com';
```

---

## Quick Links

- **Create User**: https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq/auth/users
- **SQL Editor**: https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq/sql/new
- **View Users**: https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq/auth/users
- **Test Login**: http://localhost:8082/auth

---

## Troubleshooting

### User can't login
- Make sure "Auto Confirm User" was checked
- Or manually confirm: Click user → Confirm user

### User redirected to wrong dashboard
- Check role in SQL:
  ```sql
  SELECT u.email, ur.role::text 
  FROM auth.users u 
  LEFT JOIN public.user_roles ur ON u.id = ur.user_id 
  WHERE u.email = 'user@example.com';
  ```

### "No role" showing
- Run the INSERT query again to assign role
- Make sure email matches exactly

### SQL error
- Check email is correct
- User must exist in auth.users first
- Role must be 'user' or 'admin' (lowercase)
