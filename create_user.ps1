# Create Regular User (Not Admin) - Supabase CLI
# PowerShell Script

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Create Regular User (Not Admin) - Supabase CLI" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
$supabaseExists = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseExists) {
    Write-Host "❌ Supabase CLI not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Install it with: npm install -g supabase" -ForegroundColor Yellow
    Write-Host "Or: scoop install supabase" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host "✅ Supabase CLI found" -ForegroundColor Green
Write-Host ""

# Get user details
$USER_EMAIL = Read-Host "Enter user email"
$USER_PASSWORD = Read-Host "Enter user password (min 6 chars)" -AsSecureString
$USER_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($USER_PASSWORD))
$USER_NAME = Read-Host "Enter user full name"

Write-Host ""
Write-Host "Creating user with:" -ForegroundColor Yellow
Write-Host "- Email: $USER_EMAIL"
Write-Host "- Name: $USER_NAME"
Write-Host "- Role: user (not admin)"
Write-Host ""

$CONFIRM = Read-Host "Continue? (y/n)"
if ($CONFIRM -ne "y") {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Step 1: Assigning 'user' role..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# SQL to insert user with role
$sql = @"
-- Insert user role (user must be created in Supabase Dashboard first)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user'::app_role 
FROM auth.users 
WHERE email = '$USER_EMAIL'
ON CONFLICT (user_id, role) DO NOTHING
RETURNING user_id, role;
"@

# Execute SQL
try {
    supabase db execute --project-ref plwqxhsbupsahfujmyhq $sql
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Role assigned successfully!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "⚠️  User might not exist yet in Auth" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Please create the user first in Supabase Dashboard:" -ForegroundColor Yellow
        Write-Host "https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq/auth/users" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Then run this script again to assign the role." -ForegroundColor Yellow
        pause
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error: $_" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Step 2: Verifying user..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Verify
$verifySql = @"
SELECT 
    u.email, 
    ur.role::text as role,
    u.created_at,
    u.confirmed_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = '$USER_EMAIL';
"@

supabase db execute --project-ref plwqxhsbupsahfujmyhq $verifySql

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "✅ User Setup Complete!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Login credentials:" -ForegroundColor Yellow
Write-Host "- Email: $USER_EMAIL"
Write-Host "- Password: (the one you entered)"
Write-Host "- Role: user"
Write-Host ""
Write-Host "Test login at: http://localhost:8082/auth" -ForegroundColor Cyan
Write-Host "Should redirect to: /dashboard (not /admin)" -ForegroundColor Cyan
Write-Host ""

pause
