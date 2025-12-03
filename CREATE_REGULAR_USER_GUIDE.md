# How to Create a Regular User (Not Admin)

## Quick Steps

### Step 1: Create User in Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq
2. Navigate to **Authentication** → **Users**
3. Click **"Add user"** button
4. Fill in the details:
   - **Email**: `user@example.com` (or any email you want)
   - **Password**: Set a secure password
   - **Auto Confirm User**: ✅ Check this box (so they can login immediately)
5. Click **"Create user"**
6. **IMPORTANT**: Copy the user's UUID (you'll see it in the users list)

### Step 2: Assign "User" Role

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Paste this SQL (replace `USER_UUID_HERE` with the UUID you copied):

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_UUID_HERE', 'user');
```

4. Click **"Run"**
5. You should see: "Success. No rows returned"

### Step 3: Verify the User

Run this query to verify:

```sql
SELECT u.email, ur.role, u.created_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'user@example.com';
```

You should see:
- Email: user@example.com
- Role: user
- Created_at: (timestamp)

### Step 4: Test Login

1. Go to your app: http://localhost:8082/auth
2. Login with:
   - Email: `user@example.com`
   - Password: (the password you set)
3. After login, you should be redirected to `/dashboard` (not `/admin`)

## Example: Create Multiple Users

If you want to create several users at once:

```sql
-- First create users in Authentication > Users, then run:
INSERT INTO public.user_roles (user_id, role)
VALUES 
  ('uuid-of-user-1', 'user'),
  ('uuid-of-user-2', 'user'),
  ('uuid-of-user-3', 'user');
```

## Difference Between Admin and User

### Admin Role
- Can access `/admin` dashboard
- Can issue certificates
- Can manage users
- Can view analytics
- Can revoke certificates

### User Role
- Can access `/dashboard` only
- Can view their own certificates
- Can verify certificates
- Cannot issue or manage certificates

## Check All Users and Roles

To see all users in your system:

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

## Change User Role

To change a user from 'user' to 'admin':

```sql
UPDATE public.user_roles
SET role = 'admin'
WHERE user_id = 'USER_UUID_HERE';
```

To change from 'admin' to 'user':

```sql
UPDATE public.user_roles
SET role = 'user'
WHERE user_id = 'USER_UUID_HERE';
```

## Remove User Role

```sql
DELETE FROM public.user_roles
WHERE user_id = 'USER_UUID_HERE';
```

## Troubleshooting

### User can't login
- Make sure "Auto Confirm User" was checked when creating
- Or manually confirm: Go to Authentication > Users > Click user > Confirm user

### User redirected to admin dashboard
- Check their role in user_roles table
- Make sure role is 'user' not 'admin'

### User has no role
- Run the INSERT query from Step 2
- Every user needs a role in the user_roles table
