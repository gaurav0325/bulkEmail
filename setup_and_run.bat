@echo off
echo ===================================================
echo           BULK EMAIL SENDER - SETUP
echo ===================================================
echo.

echo 1. Copying your files to the application directory...
echo.

REM Copy the actual files to the application directory
copy "C:\Gaurav\BranchSpace BA\Vouchers\Importers Data Sept 25.xlsx" "C:\Users\nishk\" 2>nul
if %errorlevel% equ 0 (
    echo ✓ Importers Data Sept 25.xlsx copied successfully
) else (
    echo ❌ Could not copy Importers Data Sept 25.xlsx
    echo   Please manually copy this file to C:\Users\nishk\
)

copy "C:\Gaurav\BranchSpace BA\Vouchers\Dear Valued Prospective Partner.docx" "C:\Users\nishk\" 2>nul
if %errorlevel% equ 0 (
    echo ✓ Dear Valued Prospective Partner.docx copied successfully
) else (
    echo ❌ Could not copy Dear Valued Prospective Partner.docx
    echo   Please manually copy this file to C:\Users\nishk\
)

echo.
echo 2. Checking Python installation...
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Python is installed
) else (
    echo ❌ Python is not installed or not in PATH
    echo   Please install Python from https://python.org
    pause
    exit /b 1
)

echo.
echo 3. Starting the email server...
echo.
echo ===================================================
echo           SERVER STARTING
echo ===================================================
echo.
echo 🌐 The application will open in your browser
echo 📧 Configure your email settings in the environment or code
echo 🛑 Press Ctrl+C to stop the server
echo.

REM Start the Python server
python email_server.py

pause