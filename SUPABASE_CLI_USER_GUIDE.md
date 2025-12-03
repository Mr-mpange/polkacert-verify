# Create User with Supabase CLI

## Prerequisites

Install Supabase CLI if you haven't:
```bash
npm install -g supabase
```

Or with Scoop (Windows):
```bash
scoop install supabase
```

## Method 1: Quick Command (Recommended)

### Step 1: Create user in Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq/auth/users
2. Click **"Add user"**
3. Enter:
   - Email: `user@example.com`
   - Password: `yourpassword`
   - ✅ Check "Auto Confirm User"
4. Click **"Create user"**

### Step 2: Assign 'user' role with CLI
```bash
supabase db execute --project-ref plwqxhsbupsahfujmyhq "INSERT INTO public.user_roles (user_id, role) SELECT id, 'user'::app_role FROM auth.users WHERE email = 'user@example.com';"
```

### Step 3: Verify
```bash
supabase db execute --project-ref plwqxhsbupsahfujmyhq "SELECT u.email, ur.role::text as role FROM auth.users u LEFT JOIN public.user_roles ur ON u.id = ur.user_id WHERE u.email = 'user@example.com';"
```

## Method 2: Using SQL File

1. Edit `add_user_role.sql` and change the email
2. Run:
```bash
supabase db execute --project-ref plwqxhsbupsahfujmyhq -f add_user_role.sql
```

## Method 3: Using Scripts

### Windows Batch:
```bash
create_user.bat
```

### PowerShell:
```bash
.\create_user.ps1
```

## Quick Examples

### Create user with email test@example.com:
```bash
# After creating in Dashboard, assign role:
supabase db execute --project-ref plwqxhsbupsahfujmyhq "INSERT INTO public.user_roles (user_id, role) SELECT id, 'user'::app_role FROM auth.users WHERE email = 'test@example.com';"
```

### Create admin user:
```bash
# After creating in Dashboard, assign admin role:
supabase db execute --project-ref plwqxhsbupsahfujmyhq "INSERT INTO public.user_roles (user_id, role) SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'admin@example.com';"
```

### List all users and roles:
```bash
supabase db execute --project-ref plwqxhsbupsahfujmyhq "SELECT u.email, ur.role::text as role, u.created_at FROM auth.users u LEFT JOIN public.user_roles ur ON u.id = ur.user_id ORDER BY u.created_at DESC;"
```

### Change user to admin:
```bash
supabase db execute --project-ref plwqxhsbupsahfujmyhq "UPDATE public.user_roles SET role = 'admin'::app_role WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com');"
```

### Remove user role:
```bash
supabase db execute --project-ref plwqxhsbupsahfujmyhq "DELETE FROM public.user_roles WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com');"
```

## Troubleshooting

### "Supabase CLI not found"
Install it:
```bash
npm install -g supabase
```

### "No rows returned"
- User doesn't exist in auth.users
- Create user in Dashboard first
- Check email spelling

### "Duplicate key value violates unique constraint"
- User already has this role
- This is OK, means role is already assigned

### User can't login
- Make sure "Auto Confirm User" was checked
- Or confirm manually in Dashboard

## Test Login

After creating user:
1. Go to: http://localhost:8082/auth
2. Login with the email and password
3. Regular users → redirected to `/dashboard`
4. Admin users → redirected to `/admin`
