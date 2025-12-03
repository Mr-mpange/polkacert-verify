@echo off
echo ============================================================
echo Create Regular User (Not Admin) - Supabase CLI
echo ============================================================
echo.

REM Check if Supabase CLI is installed
where supabase >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Supabase CLI not found!
    echo.
    echo Install it with: npm install -g supabase
    echo Or: scoop install supabase
    echo.
    pause
    exit /b 1
)

echo ✅ Supabase CLI found
echo.

REM Get user details
set /p USER_EMAIL="Enter user email: "
set /p USER_PASSWORD="Enter user password (min 6 chars): "
set /p USER_NAME="Enter user full name: "

echo.
echo Creating user with:
echo - Email: %USER_EMAIL%
echo - Name: %USER_NAME%
echo - Role: user (not admin)
echo.
set /p CONFIRM="Continue? (y/n): "

if /i not "%CONFIRM%"=="y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo ============================================================
echo Step 1: Creating user in Supabase Auth...
echo ============================================================

REM Create the user using Supabase CLI
supabase db execute --project-ref plwqxhsbupsahfujmyhq "SELECT auth.create_user(jsonb_build_object('email', '%USER_EMAIL%', 'password', '%USER_PASSWORD%', 'email_confirm', true, 'user_metadata', jsonb_build_object('full_name', '%USER_NAME%')));"

if %errorlevel% neq 0 (
    echo.
    echo ❌ Failed to create user!
    echo.
    echo Try creating manually in Supabase Dashboard:
    echo https://supabase.com/dashboard/project/plwqxhsbupsahfujmyhq/auth/users
    echo.
    pause
    exit /b 1
)

echo ✅ User created in Auth
echo.

echo ============================================================
echo Step 2: Getting user UUID...
echo ============================================================

REM Get the user UUID
supabase db execute --project-ref plwqxhsbupsahfujmyhq "SELECT id FROM auth.users WHERE email = '%USER_EMAIL%';" > temp_uuid.txt

echo.
echo ============================================================
echo Step 3: Assigning 'user' role...
echo ============================================================

REM Assign user role
supabase db execute --project-ref plwqxhsbupsahfujmyhq "INSERT INTO public.user_roles (user_id, role) SELECT id, 'user'::app_role FROM auth.users WHERE email = '%USER_EMAIL%' ON CONFLICT (user_id, role) DO NOTHING;"

if %errorlevel% neq 0 (
    echo.
    echo ❌ Failed to assign role!
    pause
    exit /b 1
)

echo ✅ Role assigned
echo.

echo ============================================================
echo Step 4: Verifying user...
echo ============================================================

supabase db execute --project-ref plwqxhsbupsahfujmyhq "SELECT u.email, ur.role, u.created_at FROM auth.users u LEFT JOIN public.user_roles ur ON u.id = ur.user_id WHERE u.email = '%USER_EMAIL%';"

echo.
echo ============================================================
echo ✅ User Created Successfully!
echo ============================================================
echo.
echo Login credentials:
echo - Email: %USER_EMAIL%
echo - Password: %USER_PASSWORD%
echo - Role: user
echo.
echo Test login at: http://localhost:8082/auth
echo Should redirect to: /dashboard (not /admin)
echo.

REM Cleanup
if exist temp_uuid.txt del temp_uuid.txt

pause
