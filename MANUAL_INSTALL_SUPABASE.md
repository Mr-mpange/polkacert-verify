# Manual Installation of Supabase CLI (5 Minutes)

## Step-by-Step Instructions

### Step 1: Download Supabase CLI

1. Click this link: https://github.com/supabase/cli/releases/latest
2. Scroll down to **Assets**
3. Click on **`supabase_windows_amd64.zip`** to download
4. Wait for download to complete

### Step 2: Extract the ZIP file

1. Go to your **Downloads** folder
2. Right-click on **`supabase_windows_amd64.zip`**
3. Select **"Extract All..."**
4. Click **"Extract"**

### Step 3: Move to a permanent location

1. Open the extracted folder
2. You'll see **`supabase.exe`**
3. Create a new folder: **`C:\supabase`**
4. Copy **`supabase.exe`** to **`C:\supabase`**

### Step 4: Add to PATH

1. Press **Windows Key**
2. Type: **"environment variables"**
3. Click **"Edit the system environment variables"**
4. Click **"Environment Variables..."** button
5. Under **"User variables"**, find and select **"Path"**
6. Click **"Edit..."**
7. Click **"New"**
8. Type: **`C:\supabase`**
9. Click **"OK"** on all windows

### Step 5: Verify Installation

1. **Close all terminal windows**
2. Open a **new** Command Prompt or PowerShell
3. Type:
   ```bash
   supabase --version
   ```
4. You should see: `1.x.x` (version number)

✅ **Done!** Supabase CLI is installed!

---

## Quick Test

Try this command:
```bash
supabase db execute --project-ref plwqxhsbupsahfujmyhq "SELECT version();"
```

You should see PostgreSQL version info.

---

## Alternative: Use Dashboard Instead

If installation is too complicated, just use the Supabase Dashboard:

1. **Create users**: https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq/auth/users
2. **Run SQL**: https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq/sql/new

No CLI needed! See **CREATE_USER_NO_CLI.md** for details.

---

## Troubleshooting

### "supabase is not recognized"
- Make sure you closed and reopened your terminal
- Check PATH was added correctly
- Try restarting your computer

### Can't download from GitHub
- Check your internet connection
- Try a different browser
- Use VPN if GitHub is blocked

### Don't have admin rights
- Install to your user folder instead: `%USERPROFILE%\supabase`
- Add that path to User PATH (not System PATH)
