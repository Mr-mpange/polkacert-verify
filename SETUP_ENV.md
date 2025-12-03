# 🔧 Environment Setup Guide

## Quick Setup (5 minutes)

### Step 1: Copy Example File
```bash
# Copy .env.example to .env
copy .env.example .env
```

### Step 2: Get Supabase Credentials

**Go to**: https://supabase.com/

1. **Create Account** (if you don't have one)
2. **Create New Project**
   - Click "New Project"
   - Choose organization
   - Enter project name
   - Choose database password
   - Select region (closest to you)
   - Click "Create new project"
   - Wait 2-3 minutes for setup

3. **Get API Credentials**
   - Go to **Settings** (left sidebar)
   - Click **API**
   - Copy these values:

```env
# Copy "Project URL"
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# Copy "anon public" key (under Project API keys)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eHh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODg4ODg4ODgsImV4cCI6MjAwNDQ2NDg4OH0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Setup Database

1. In Supabase dashboard, go to **SQL Editor**
2. Run migrations from `supabase/migrations/` in order:
   - Open `20240101000000_initial_schema.sql`
   - Copy content
   - Paste in SQL Editor
   - Click "Run"
   - Repeat for other migration files

### Step 4: Choose Blockchain Network

**For Testing (Recommended):**
```env
VITE_POLKADOT_ENDPOINT=wss://westend-rpc.polkadot.io
```
- Free test tokens
- No real money needed
- Perfect for development

**For Production:**
```env
VITE_POLKADOT_ENDPOINT=wss://rpc.polkadot.io
```
- Requires real DOT tokens
- Use only when ready for production

### Step 5: Subscan API Key (Optional)

**Without API Key:**
- Works fine
- 5 requests/second limit
- Good for testing

**With API Key:**
- 50 requests/second
- Better performance
- Recommended for production

**To get API key:**
1. Go to https://support.subscan.io/
2. Register account
3. Create API key
4. Add to `.env`:
```env
VITE_SUBSCAN_API_KEY=your-api-key-here
```

---

## Complete .env Example

```env
# Supabase (REQUIRED)
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY4ODg4ODg4OCwiZXhwIjoyMDA0NDY0ODg4fQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Polkadot (REQUIRED)
VITE_POLKADOT_ENDPOINT=wss://westend-rpc.polkadot.io

# Subscan (OPTIONAL)
VITE_SUBSCAN_API_KEY=your-subscan-api-key-here
```

---

## Verification

After setting up `.env`:

```bash
# 1. Install dependencies
npm install

# 2. Start application
START_ALL.bat

# 3. Check if it works
# Open: http://localhost:5173
# You should see the app without errors
```

---

## Troubleshooting

### "Supabase client error"
- Check `VITE_SUPABASE_URL` is correct
- Check `VITE_SUPABASE_ANON_KEY` is correct
- Make sure no extra spaces
- Make sure URL starts with `https://`

### "Polkadot connection failed"
- Check internet connection
- Try alternative endpoint:
  - `wss://westend-rpc.polkadot.io`
  - `wss://rpc.polkadot.io`

### "Database error"
- Make sure you ran all migrations
- Check Supabase project is active
- Go to Supabase dashboard > Database

### ".env file not found"
- Make sure you copied `.env.example` to `.env`
- Make sure `.env` is in root folder (same level as package.json)

---

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` to git (already in .gitignore)
- Never share your `.env` file
- Never share your Supabase keys publicly
- Use different keys for development and production

✅ **Safe to share:**
- `.env.example` (no real values)
- Polkadot endpoint (public)

❌ **Never share:**
- `.env` (has real keys)
- Supabase URL and keys
- Subscan API key

---

## Ready?

After completing setup:

```bash
START_ALL.bat
```

Your app should start at: http://localhost:5173

🎉 **Done!**
