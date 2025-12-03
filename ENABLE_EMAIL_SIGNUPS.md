# Enable Email Signups in Supabase

## Quick Steps (2 minutes)

### Step 1: Go to Authentication Settings

Click this link (opens in new tab):
**https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq/auth/providers**

Or manually:
1. Go to https://supabase.com/dashboard
2. Select your project: **plwqxhsbupsahfujmyhq**
3. Click **Authentication** in left sidebar
4. Click **Providers**

### Step 2: Enable Email Signups

1. Find **Email** in the providers list
2. Click on **Email** to expand settings
3. Look for **"Enable email provider"** - make sure it's ON (green toggle)
4. Find **"Confirm email"** setting:
   - **OFF** = Users can signup and login immediately (easier for testing)
   - **ON** = Users must verify email before login (more secure)
5. Scroll down and click **"Save"**

### Step 3: Test Signup

1. Go to your app: http://localhost:8082/auth
2. Click **"Sign Up"** tab
3. Fill in:
   - Full Name: Test User
   - Email: test@example.com
   - Password: password123
4. Click **"Sign Up"**
5. ✅ Should create account and login!

---

## Screenshot Guide

### What You'll See:

```
Authentication → Providers → Email

┌─────────────────────────────────────┐
│ Email                               │
│                                     │
│ ☑ Enable email provider            │  ← Make sure this is ON
│                                     │
│ Confirm email                       │
│ ○ OFF  ● ON                        │  ← Choose OFF for testing
│                                     │
│ [Save]                             │  ← Click Save
└─────────────────────────────────────┘
```

---

## Settings Explained

### Enable email provider
- **ON**: Users can signup with email/password
- **OFF**: Email signup disabled (current issue)

### Confirm email
- **OFF**: Users can login immediately after signup (recommended for testing)
- **ON**: Users must click email confirmation link before login (more secure for production)

### Secure email change
- **ON**: Requires confirmation for email changes (recommended)
- **OFF**: Email changes happen immediately

---

## Alternative: Allow Specific Domains Only

If you want to restrict signups to certain email domains:

1. Go to **Authentication** → **URL Configuration**
2. Under **Site URL**, set your app URL
3. Under **Redirect URLs**, add allowed URLs
4. Go to **Authentication** → **Email Templates**
5. Customize confirmation email

---

## Troubleshooting

### Still getting "Signups not allowed"
- Make sure you clicked **Save** after enabling
- Wait 10 seconds for changes to apply
- Refresh your app page
- Try in incognito/private window

### Users not receiving confirmation emails
- Check spam folder
- Verify email settings in Authentication → Email Templates
- For testing, turn OFF "Confirm email"

### Want to disable signups again
- Go back to Providers → Email
- Turn OFF "Enable email provider"
- Click Save

---

## Quick Links

- **Enable Signups**: https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq/auth/providers
- **View Users**: https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq/auth/users
- **Email Templates**: https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq/auth/templates
- **Test App**: http://localhost:8082/auth

---

## After Enabling Signups

New users will be created with:
- ✅ Email and password authentication
- ✅ Profile in `profiles` table
- ⚠️ **No role assigned** (they won't be able to access dashboards)

### Assign Role to New Users

After a user signs up, assign them a role:

1. Go to SQL Editor: https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq/sql/new

2. Run this SQL:
```sql
-- Assign 'user' role to new signup
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user'::app_role 
FROM auth.users 
WHERE email = 'test@example.com';
```

Or make them admin:
```sql
-- Assign 'admin' role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role 
FROM auth.users 
WHERE email = 'test@example.com';
```

### Auto-Assign Role on Signup (Advanced)

To automatically assign 'user' role when someone signs up, you can create a database trigger. See `CREATE_AUTO_ROLE_TRIGGER.sql` for details.
