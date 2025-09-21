@echo off
echo ============================================================
echo      CONFIGURE WINDOWS FIREWALL FOR EMAIL SENDER
echo ============================================================
echo.

echo This script will configure Windows Firewall to allow
echo incoming connections on port 8080 for the Email Sender.
echo.

echo Running as Administrator is required...
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✓ Running as Administrator
    echo.
    echo Adding firewall rule for port 8080...

    netsh advfirewall firewall add rule name="Bulk Email Sender - Port 8080" dir=in action=allow protocol=TCP localport=8080

    if %errorLevel% == 0 (
        echo ✓ Firewall rule added successfully!
        echo.
        echo Port 8080 is now open for incoming connections.
        echo You can now access the application from other devices on your network.
    ) else (
        echo ❌ Failed to add firewall rule.
    )
) else (
    echo ❌ This script must be run as Administrator!
    echo.
    echo Right-click this file and select "Run as Administrator"
)

echo.
echo ============================================================
echo                    NEXT STEPS
echo ============================================================
echo.
echo 1. ✓ Windows Firewall configured
echo 2. Configure your router for internet access:
echo    - Open router admin panel (usually 192.168.1.1)
echo    - Add port forwarding rule: External 8080 → Internal 8080
echo    - Point to this computer's IP address
echo.
echo 3. Test access:
echo    - Local: http://localhost:8080/complete-email-sender.html
echo    - Network: http://YOUR_LOCAL_IP:8080/complete-email-sender.html
echo    - Internet: http://YOUR_PUBLIC_IP:8080/complete-email-sender.html
echo.

pause