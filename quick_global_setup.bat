@echo off
title Intex Email Campaign - Global Internet Setup
color 0A

echo.
echo ================================================================
echo           INTEX EMAIL CAMPAIGN - GLOBAL INTERNET SETUP
echo ================================================================
echo.

echo Step 1: Finding Your Network Information...
echo.

echo [1] YOUR LOCAL IP ADDRESSES:
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do (
    set "ip=%%i"
    set "ip=!ip: =!"
    if not "!ip!"=="" echo     Local IP: !ip!
)

echo.
echo [2] YOUR PUBLIC IP ADDRESS:
echo     Checking your public IP address...
for /f %%i in ('powershell -command "(Invoke-WebRequest -Uri 'https://api.ipify.org' -UseBasicParsing).Content"') do (
    echo     Public IP: %%i
    set PUBLIC_IP=%%i
)

echo.
echo [3] YOUR ROUTER GATEWAY:
for /f "tokens=3" %%i in ('route print ^| findstr "0.0.0.0.*0.0.0.0"') do (
    echo     Router IP: %%i (Open in browser for port forwarding)
    set ROUTER_IP=%%i
)

echo.
echo ================================================================
echo                    QUICK ACCESS URLS
echo ================================================================
echo.

echo [LOCAL ACCESS] (Same computer):
echo     http://localhost:8080/complete-email-sender.html
echo.

echo [NETWORK ACCESS] (Same WiFi/office):
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4" ^| head -1') do (
    set "localip=%%i"
    set "localip=!localip: =!"
    echo     http://!localip!:8080/complete-email-sender.html
)

echo.
echo [GLOBAL ACCESS] (Anywhere on internet):
if defined PUBLIC_IP (
    echo     http://%PUBLIC_IP%:8080/complete-email-sender.html
    echo     ^(After router port forwarding setup^)
)

echo.
echo ================================================================
echo                    SETUP REQUIREMENTS
echo ================================================================
echo.

echo TO ENABLE GLOBAL ACCESS, COMPLETE THESE STEPS:
echo.
echo 1. CONFIGURE ROUTER PORT FORWARDING:
if defined ROUTER_IP (
    echo    - Open browser: http://%ROUTER_IP%
) else (
    echo    - Open browser: http://192.168.1.1 ^(or your router IP^)
)
echo    - Login with admin credentials
echo    - Go to: Advanced Settings ^> Port Forwarding
echo    - Add rule: External Port 8080 ^> Internal Port 8080
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4" ^| head -1') do (
    set "targetip=%%i"
    set "targetip=!targetip: =!"
    echo    - Target IP: !targetip!
)
echo    - Protocol: TCP, Status: Enabled
echo.

echo 2. CONFIGURE WINDOWS FIREWALL:
echo    - Right-click 'configure_firewall.bat' ^> 'Run as Administrator'
echo    - Or manually allow port 8080 in Windows Firewall
echo.

echo 3. ALTERNATIVE - INSTANT GLOBAL ACCESS:
echo    - Download ngrok: https://ngrok.com/download
echo    - Run: ngrok http 8080
echo    - Use provided URL for instant global access
echo.

echo 4. PROFESSIONAL OPTION - CLOUD HOSTING:
echo    - DigitalOcean: $5/month professional hosting
echo    - Heroku: Free tier available
echo    - AWS: Pay-as-you-go pricing
echo.

echo ================================================================
echo                    READY TO START SERVER
echo ================================================================
echo.

echo Press any key to start the email campaign server...
echo The server will be accessible locally while you configure global access.
echo.
pause

echo.
echo Starting Intex Email Campaign Server...
echo Server will be available at: http://localhost:8080/complete-email-sender.html
echo.
echo Configure router port forwarding for global access using the information above.
echo.

python enhanced_email_server.py

echo.
echo Server stopped. Press any key to exit...
pause >nul