@echo off
echo ============================================================
echo         ENHANCED BULK EMAIL SENDER - SETUP
echo ============================================================
echo.

echo 1. Setting up Brevo API configuration...
echo.

echo To use real email sending, you need a Brevo API key:
echo 1. Go to https://app.brevo.com/settings/keys/api
echo 2. Create a new API key
echo 3. Copy the key and set it as environment variable

echo.
set /p BREVO_KEY="Enter your Brevo API key (or press Enter to skip): "

if not "%BREVO_KEY%"=="" (
    setx BREVO_API_KEY "%BREVO_KEY%"
    echo ✓ Brevo API key configured
) else (
    echo ⚠ Skipping Brevo setup - emails will use simulation mode
)

echo.
echo 2. Starting enhanced email server...
echo.

echo ============================================================
echo           ENHANCED SERVER STARTING
echo ============================================================
echo.
echo 🌐 Web accessible: http://your-ip-address:8080
echo 🏠 Local access: http://localhost:8080
echo 📧 Email service: Brevo API integration
echo 📊 Multi-worksheet Excel support
echo 🎯 Automatic personalization
echo.

python enhanced_email_server.py

pause