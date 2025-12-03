# Setup Supabase Storage Bucket

## Error: "Bucket not found"

You need to create a storage bucket in Supabase to store certificate files.

## Quick Setup (2 minutes):

### Step 1: Go to Supabase Storage

1. Open: https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq/storage/buckets
2. Or: Dashboard → Storage → Buckets

### Step 2: Create Bucket

1. Click **"New bucket"** button
2. Fill in:
   - **Name**: `certificates`
   - **Public bucket**: ✅ Check this (so files are publicly accessible)
   - **File size limit**: 5 MB
   - **Allowed MIME types**: Leave empty (or add: image/jpeg, image/png, image/webp, application/pdf)
3. Click **"Create bucket"**

### Step 3: Set Bucket Policies (Important!)

1. Click on the `certificates` bucket
2. Go to **"Policies"** tab
3. Click **"New policy"**
4. Select **"For full customization"**
5. Add these policies:

#### Policy 1: Allow Public Read
```sql
-- Name: Public read access
-- Operation: SELECT
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'certificates');
```

#### Policy 2: Allow Authenticated Upload
```sql
-- Name: Authenticated users can upload
-- Operation: INSERT
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'certificates');
```

#### Policy 3: Allow Users to Update Their Files
```sql
-- Name: Users can update own files
-- Operation: UPDATE
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'certificates' AND auth.uid() = owner);
```

### Step 4: Test Upload

1. Go back to your app
2. Try uploading a certificate with a file
3. Should work now!

---

## Alternative: Use Without File Upload

The app now works **without** file upload! If the bucket doesn't exist:
- ✅ Certificate data is still saved
- ✅ Blockchain hash is still stored
- ✅ QR code is still generated
- ⚠️ File upload is skipped with a warning

You can upload certificates without files and add the storage bucket later.

---

## Quick Policy Setup (Copy-Paste)

Go to: https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq/storage/policies

Click "New Policy" → "For full customization" and paste:

```sql
-- Allow public read
CREATE POLICY "public_read" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'certificates');

-- Allow authenticated upload
CREATE POLICY "authenticated_upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'certificates');

-- Allow users to update their files
CREATE POLICY "user_update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'certificates' AND auth.uid() = owner);
```

---

## Troubleshooting

### "Bucket not found" error
- Make sure bucket name is exactly `certificates` (lowercase)
- Refresh Supabase dashboard
- Check bucket was created successfully

### Files not uploading
- Check bucket policies are set
- Make sure "Public bucket" is enabled
- Check file size is under 5MB

### Can't access uploaded files
- Make sure "Public read access" policy is set
- Check bucket is marked as public
- Try accessing the URL directly

---

## What Gets Stored

When you upload a certificate with a file:
- **File**: Stored in Supabase Storage
- **URL**: Saved in database (`ipfs_hash` field)
- **Data**: Certificate details in database
- **Hash**: Blockchain proof on Polkadot

---

## Current Status

✅ **App works without storage** - You can upload certificates now
⚠️ **File upload disabled** - Until bucket is created
🔧 **Easy to add later** - Just create the bucket when ready

You can continue using the app without file uploads, or set up the bucket now to enable file storage!
