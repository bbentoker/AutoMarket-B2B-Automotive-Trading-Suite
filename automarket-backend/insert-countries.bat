@echo off
echo ==========================================
echo Country Insertion Tool
echo ==========================================
echo.

REM Check if .env file exists
if not exist ".env" (
    echo ❌ .env file not found. Please create one with database credentials.
    echo Required variables for database connection:
    echo - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
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

REM Check if countries.json exists
if not exist "src\sql\countries.json" (
    echo ❌ countries.json file not found at src\sql\countries.json
    echo Please ensure the file exists before running this script
    pause
    exit /b 1
)

echo 🌍 Starting country insertion process...
echo.

REM Run the insertion script
node insert-countries.js %*

echo.
echo ✅ Country insertion process completed!
pause
