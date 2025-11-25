@echo off
echo === Grafana SMTP Configuration ===
echo.
echo Finding Grafana installation...

set GRAFANA_PATH=C:\Program Files\GrafanaLabs\grafana
set CONF_PATH=%GRAFANA_PATH%\conf
set CUSTOM_INI=%CONF_PATH%\custom.ini

if not exist "%GRAFANA_PATH%" (
    echo ERROR: Grafana not found at %GRAFANA_PATH%
    echo Please check your Grafana installation path.
    pause
    exit /b 1
)

echo Found Grafana at: %GRAFANA_PATH%
echo Configuration path: %CONF_PATH%
echo.

echo Creating SMTP configuration...

if exist "%CUSTOM_INI%" (
    echo Backing up existing custom.ini...
    copy "%CUSTOM_INI%" "%CUSTOM_INI%.backup-%date:~-4,4%%date:~-10,2%%date:~-7,2%"
)

echo [smtp] > "%CUSTOM_INI%"
echo enabled = true >> "%CUSTOM_INI%"
echo host = smtp.gmail.com:587 >> "%CUSTOM_INI%"
echo user = arunbalaji2323@gmail.com >> "%CUSTOM_INI%"
echo password = alxqhdphjpvgdkgc >> "%CUSTOM_INI%"
echo skip_verify = false >> "%CUSTOM_INI%"
echo from_address = arunbalaji2323@gmail.com >> "%CUSTOM_INI%"
echo from_name = NL2PromQL Alerts >> "%CUSTOM_INI%"
echo startTLS_policy = MandatoryStartTLS >> "%CUSTOM_INI%"

echo.
echo SMTP configuration created successfully!
echo Configuration saved to: %CUSTOM_INI%
echo.
echo Restarting Grafana service...

net stop Grafana
timeout /t 3 /nobreak >nul
net start Grafana

echo.
echo === Configuration Complete ===
echo.
echo Grafana should be restarting now...
echo Wait 10 seconds, then refresh Grafana in your browser.
echo.
echo Next steps:
echo 1. Open: http://localhost:3000
echo 2. Go to: Alerting -^> Contact points
echo 3. Test the email contact point
echo.
pause
