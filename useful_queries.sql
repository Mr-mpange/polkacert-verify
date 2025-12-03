-- Useful Database Queries for CertiChain
-- Run these in Supabase SQL Editor: https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq/sql/new

-- ============================================================
-- USER MANAGEMENT
-- ============================================================

-- View all users with their roles
SELECT 
  u.email,
  p.full_name,
  COALESCE(ur.role::text, 'no role') as role,
  u.created_at,
  u.last_sign_in_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
ORDER BY u.created_at DESC;

-- Count users by role
SELECT 
  COALESCE(role::text, 'no role') as role,
  COUNT(*) as count
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
GROUP BY role;

-- Make user admin
UPDATE user_roles
SET role = 'admin'::app_role
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com');

-- Make user regular user
UPDATE user_roles
SET role = 'user'::app_role
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');

-- ============================================================
-- CERTIFICATE MANAGEMENT
-- ============================================================

-- View all certificates
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
LIMIT 50;

-- Count certificates by status
SELECT 
  status,
  COUNT(*) as count
FROM certificates
GROUP BY status;

-- Find certificate by ID
SELECT * FROM certificates
WHERE certificate_id = 'CERT-2024-001';

-- Search certificates by holder name
SELECT 
  certificate_id,
  holder_name,
  course_name,
  status,
  issue_date
FROM certificates
WHERE holder_name ILIKE '%john%'
ORDER BY created_at DESC;

-- Certificates issued this month
SELECT 
  certificate_id,
  holder_name,
  course_name,
  created_at
FROM certificates
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
ORDER BY created_at DESC;

-- Revoke certificate
UPDATE certificates
SET status = 'revoked', updated_at = NOW()
WHERE certificate_id = 'CERT-2024-001';

-- Reactivate certificate
UPDATE certificates
SET status = 'active', updated_at = NOW()
WHERE certificate_id = 'CERT-2024-001';

-- ============================================================
-- BLOCKCHAIN DATA
-- ============================================================

-- Certificates with blockchain data
SELECT 
  certificate_id,
  holder_name,
  blockchain_hash,
  blockchain_tx_hash,
  blockchain_block_number,
  created_at
FROM certificates
WHERE blockchain_hash IS NOT NULL
ORDER BY created_at DESC;

-- Certificates without blockchain data
SELECT 
  certificate_id,
  holder_name,
  status,
  created_at
FROM certificates
WHERE blockchain_hash IS NULL
ORDER BY created_at DESC;

-- ============================================================
-- VERIFICATION LOGS
-- ============================================================

-- Recent verifications
SELECT 
  vl.certificate_id,
  c.holder_name,
  c.certificate_id as cert_number,
  vl.verification_method,
  vl.result,
  vl.created_at
FROM verification_logs vl
LEFT JOIN certificates c ON vl.certificate_id = c.id
ORDER BY vl.created_at DESC
LIMIT 50;

-- Verification stats by day
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_verifications,
  SUM(CASE WHEN result = 'success' THEN 1 ELSE 0 END) as successful,
  SUM(CASE WHEN result = 'failed' THEN 1 ELSE 0 END) as failed
FROM verification_logs
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 30;

-- Verifications today
SELECT COUNT(*) as today_verifications
FROM verification_logs
WHERE created_at >= CURRENT_DATE;

-- ============================================================
-- DASHBOARD STATISTICS
-- ============================================================

-- Complete dashboard stats
SELECT 
  (SELECT COUNT(*) FROM certificates) as total_certificates,
  (SELECT COUNT(*) FROM certificates WHERE status = 'active') as active_certificates,
  (SELECT COUNT(*) FROM certificates WHERE status = 'revoked') as revoked_certificates,
  (SELECT COUNT(*) FROM certificates WHERE created_at >= CURRENT_DATE) as issued_today,
  (SELECT COUNT(*) FROM certificates WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) as issued_this_month,
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM user_roles WHERE role = 'admin') as admin_count,
  (SELECT COUNT(*) FROM verification_logs WHERE created_at >= CURRENT_DATE) as verifications_today;

-- Certificates by institution
SELECT 
  institution,
  COUNT(*) as count,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
  COUNT(CASE WHEN status = 'revoked' THEN 1 END) as revoked
FROM certificates
GROUP BY institution
ORDER BY count DESC;

-- Certificates by month
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as certificates_issued
FROM certificates
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC
LIMIT 12;

-- ============================================================
-- DATA CLEANUP
-- ============================================================

-- Find duplicate certificate IDs
SELECT 
  certificate_id,
  COUNT(*) as count
FROM certificates
GROUP BY certificate_id
HAVING COUNT(*) > 1;

-- Delete old verification logs (older than 90 days)
-- DELETE FROM verification_logs
-- WHERE created_at < NOW() - INTERVAL '90 days';

-- Find users without roles
SELECT 
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.role IS NULL;

-- ============================================================
-- EXPORT DATA
-- ============================================================

-- Export all certificates (CSV format)
SELECT 
  certificate_id,
  holder_name,
  course_name,
  institution,
  issue_date,
  status,
  blockchain_hash,
  blockchain_tx_hash,
  created_at
FROM certificates
ORDER BY created_at DESC;

-- Export all users
SELECT 
  u.email,
  p.full_name,
  ur.role::text as role,
  u.created_at,
  u.last_sign_in_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
ORDER BY u.created_at DESC;
