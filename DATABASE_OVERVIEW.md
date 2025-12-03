# Database Overview - CertiChain

## Tables Summary

### 1. **certificates** (32 kB, 15 columns)
Stores all issued certificates

**Key Columns:**
- `id` - UUID primary key
- `certificate_id` - Unique certificate identifier (e.g., CERT-2024-001)
- `holder_name` - Certificate recipient name
- `course_name` - Course/program name
- `institution` - Issuing institution
- `issue_date` - Date certificate was issued
- `status` - active, revoked, expired
- `blockchain_hash` - Hash stored on Polkadot blockchain
- `blockchain_tx_hash` - Transaction hash
- `blockchain_block_number` - Block number
- `qr_code` - QR code data
- `issuer_id` - User who issued the certificate
- `created_at` - Timestamp
- `updated_at` - Timestamp

**View All Certificates:**
```sql
SELECT 
  certificate_id,
  holder_name,
  course_name,
  institution,
  status,
  issue_date,
  created_at
FROM certificates
ORDER BY created_at DESC
LIMIT 20;
```

**Count by Status:**
```sql
SELECT status, COUNT(*) as count
FROM certificates
GROUP BY status;
```

---

### 2. **profiles** (232 kB, 5 columns)
User profile information

**Key Columns:**
- `id` - UUID (references auth.users)
- `email` - User email
- `full_name` - User's full name
- `created_at` - Account creation date
- `updated_at` - Last update

**View All Profiles:**
```sql
SELECT 
  p.email,
  p.full_name,
  ur.role::text as role,
  p.created_at
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
ORDER BY p.created_at DESC;
```

---

### 3. **user_roles** (240 kB, 4 columns)
User role assignments (admin or user)

**Key Columns:**
- `id` - UUID primary key
- `user_id` - References auth.users
- `role` - 'admin' or 'user'
- `created_at` - When role was assigned

**View All Users with Roles:**
```sql
SELECT 
  u.email,
  ur.role::text as role,
  u.created_at as user_created,
  u.last_sign_in_at
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
ORDER BY u.created_at DESC;
```

**Count by Role:**
```sql
SELECT 
  COALESCE(role::text, 'no role') as role,
  COUNT(*) as count
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
GROUP BY role;
```

---

### 4. **verification_logs** (No size shown)
Tracks certificate verification attempts

**Key Columns:**
- `id` - UUID primary key
- `certificate_id` - Which certificate was verified
- `verified_by` - IP or user who verified
- `verification_method` - QR, manual, API
- `result` - success, failed
- `created_at` - When verification happened

**Recent Verifications:**
```sql
SELECT 
  vl.certificate_id,
  c.holder_name,
  vl.verification_method,
  vl.result,
  vl.created_at
FROM verification_logs vl
LEFT JOIN certificates c ON vl.certificate_id = c.id
ORDER BY vl.created_at DESC
LIMIT 20;
```

**Verification Stats:**
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_verifications,
  SUM(CASE WHEN result = 'success' THEN 1 ELSE 0 END) as successful,
  SUM(CASE WHEN result = 'failed' THEN 1 ELSE 0 END) as failed
FROM verification_logs
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 30;
```

---

### 5. **certificate_stats** (12 columns)
View/materialized view for statistics

**Purpose:** Aggregated statistics for dashboard

**View Stats:**
```sql
SELECT * FROM certificate_stats;
```

---

## Common Queries

### Dashboard Statistics

```sql
-- Total certificates issued
SELECT COUNT(*) as total_certificates FROM certificates;

-- Active vs Revoked
SELECT 
  status,
  COUNT(*) as count
FROM certificates
GROUP BY status;

-- Certificates issued this month
SELECT COUNT(*) as this_month
FROM certificates
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE);

-- Total users
SELECT COUNT(*) as total_users FROM auth.users;

-- Admin count
SELECT COUNT(*) as admin_count
FROM user_roles
WHERE role = 'admin';

-- Recent verifications (today)
SELECT COUNT(*) as today_verifications
FROM verification_logs
WHERE created_at >= CURRENT_DATE;
```

### Certificate Management

```sql
-- Find certificate by ID
SELECT * FROM certificates
WHERE certificate_id = 'CERT-2024-001';

-- Revoke certificate
UPDATE certificates
SET status = 'revoked', updated_at = NOW()
WHERE certificate_id = 'CERT-2024-001';

-- Reactivate certificate
UPDATE certificates
SET status = 'active', updated_at = NOW()
WHERE certificate_id = 'CERT-2024-001';

-- Delete certificate (careful!)
DELETE FROM certificates
WHERE certificate_id = 'CERT-2024-001';

-- Search certificates by holder name
SELECT certificate_id, holder_name, course_name, status
FROM certificates
WHERE holder_name ILIKE '%john%'
ORDER BY created_at DESC;
```

### User Management

```sql
-- Find user by email
SELECT u.id, u.email, ur.role::text as role
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email = 'user@example.com';

-- Make user admin
UPDATE user_roles
SET role = 'admin'::app_role
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com');

-- Remove user role
DELETE FROM user_roles
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com');

-- Delete user completely
DELETE FROM auth.users WHERE email = 'user@example.com';
```

### Blockchain Data

```sql
-- Certificates with blockchain data
SELECT 
  certificate_id,
  holder_name,
  blockchain_hash,
  blockchain_tx_hash,
  blockchain_block_number
FROM certificates
WHERE blockchain_hash IS NOT NULL
ORDER BY created_at DESC;

-- Certificates without blockchain data
SELECT certificate_id, holder_name, created_at
FROM certificates
WHERE blockchain_hash IS NULL;
```

---

## Database Maintenance

### Backup Important Data

```sql
-- Export all certificates (copy results)
SELECT * FROM certificates ORDER BY created_at;

-- Export all users and roles
SELECT 
  u.email,
  p.full_name,
  ur.role::text as role,
  u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN user_roles ur ON u.id = ur.user_id;
```

### Clean Up

```sql
-- Delete old verification logs (older than 90 days)
DELETE FROM verification_logs
WHERE created_at < NOW() - INTERVAL '90 days';

-- Find duplicate certificates
SELECT certificate_id, COUNT(*) as count
FROM certificates
GROUP BY certificate_id
HAVING COUNT(*) > 1;
```

---

## Quick Links

- **SQL Editor**: https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq/sql/new
- **Table Editor**: https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq/editor
- **Database**: https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq/database/tables
- **Auth Users**: https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq/auth/users

---

## Database Size

- **certificates**: 32 kB (15 columns)
- **profiles**: 232 kB (5 columns)
- **user_roles**: 240 kB (4 columns)
- **verification_logs**: Size varies
- **certificate_stats**: 12 columns (view)

**Total**: ~504 kB + verification_logs

---

## Security Notes

- All tables have Row Level Security (RLS) enabled
- Only admins can insert/update certificates
- Users can view their own data
- Verification logs are admin-only
- Blockchain data is immutable once set
