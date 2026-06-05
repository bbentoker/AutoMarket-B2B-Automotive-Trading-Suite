@echo off
echo ==========================================
echo MinIO Bucket Configuration Tool
echo ==========================================
echo.

REM Check if .env file exists
if not exist ".env" (
    echo ❌ .env file not found. Please create one with MinIO credentials.
    echo Required variables:
    echo - MINIO_ROOT_USER (or AWS_ACCESS_KEY_ID as fallback)
    echo - MINIO_ROOT_PASSWORD (or AWS_SECRET_ACCESS_KEY as fallback)
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo 🚀 Starting MinIO bucket configuration tool...
echo.

REM Run the configuration script
node configure-minio-bucket.js %*

echo.
echo ✅ Configuration tool completed!
pause
