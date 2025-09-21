@echo off
echo ============================================================
echo         BULK EMAIL SENDER - INTERNET ACCESS SETUP
echo ============================================================
echo.

echo 1. Finding your IP addresses...
echo.

echo YOUR LOCAL IP ADDRESSES:
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do echo   Local IP: %%i

echo.
echo YOUR PUBLIC IP ADDRESS:
echo   Checking... (requires internet connection)
for /f %%i in ('curl -s https://api.ipify.org 2^>nul') do echo   Public IP: %%i

echo.
echo ============================================================
echo                    ACCESS INFORMATION
echo ============================================================
echo.
echo LOCAL ACCESS (same computer):
echo   http://localhost:8080/complete-email-sender.html
echo.
echo NETWORK ACCESS (same WiFi/network):
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4" ^| head -1') do echo   http://%%i:8080/complete-email-sender.html

echo.
echo INTERNET ACCESS (after port forwarding):
for /f %%i in ('curl -s https://api.ipify.org 2^>nul') do echo   http://%%i:8080/complete-email-sender.html

echo.
echo ============================================================
echo.
echo NEXT STEPS FOR INTERNET ACCESS:
echo 1. Configure router port forwarding (port 8080)
echo 2. Configure Windows Firewall to allow port 8080
echo 3. Or use ngrok for quick testing: ngrok http 8080
echo.
echo Starting server...
echo ============================================================

python enhanced_email_server.py

pause