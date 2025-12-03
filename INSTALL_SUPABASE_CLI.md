# Install Supabase CLI on Windows

## ❌ Don't use npm
```bash
# This doesn't work anymore:
npm install -g supabase
```

## ✅ Use one of these methods:

### Method 1: Scoop (Recommended for Windows)

1. **Install Scoop** (if you don't have it):
```powershell
# Run in PowerShell:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
```

2. **Install Supabase CLI**:
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

3. **Verify**:
```bash
supabase --version
```

### Method 2: Direct Download (Easiest)

1. Download the Windows binary:
   - Go to: https://github.com/supabase/cli/releases/latest
   - Download: `supabase_windows_amd64.zip`

2. Extract the zip file

3. Move `supabase.exe` to a folder in your PATH, or:
   - Create folder: `C:\supabase`
   - Move `supabase.exe` there
   - Add to PATH:
     ```
     Windows Key → Search "Environment Variables"
     → Edit System Environment Variables
     → Environment Variables
     → System Variables → Path → Edit
     → New → C:\supabase
     → OK
     ```

4. Restart your terminal and verify:
```bash
supabase --version
```

### Method 3: Chocolatey

```bash
choco install supabase
```

### Method 4: Winget

```bash
winget install --id Supabase.CLI
```

## After Installation

Test it works:
```bash
supabase --version
```

You should see something like: `1.x.x`

## Alternative: Use Supabase Dashboard Instead

If you don't want to install CLI, you can do everything in the web dashboard:

1. **Create User**: https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq/auth/users
2. **Assign Role**: https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq/sql/new

Then run this SQL:
```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user'::app_role 
FROM auth.users 
WHERE email = 'user@example.com';
```
