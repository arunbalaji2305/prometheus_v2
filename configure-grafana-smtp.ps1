# Grafana SMTP Configuration Script
# Run this with Administrator privileges

Write-Host "=== Grafana SMTP Configuration ===" -ForegroundColor Cyan
Write-Host ""

# Find Grafana installation directory
$grafanaPath = "C:\Program Files\GrafanaLabs\grafana"

if (-not (Test-Path $grafanaPath)) {
    Write-Host "Grafana not found at $grafanaPath" -ForegroundColor Red
    Write-Host "Searching for Grafana installation..." -ForegroundColor Yellow
    $grafanaExe = Get-ChildItem "C:\Program Files" -Recurse -Filter "grafana-server.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($grafanaExe) {
        $grafanaPath = $grafanaExe.Directory.FullName
        Write-Host "Found Grafana at: $grafanaPath" -ForegroundColor Green
    } else {
        Write-Host "Could not find Grafana installation. Please install Grafana first." -ForegroundColor Red
        exit 1
    }
}

$confPath = Join-Path $grafanaPath "conf"
$customIniPath = Join-Path $confPath "custom.ini"
$defaultIniPath = Join-Path $confPath "defaults.ini"

Write-Host "Configuration directory: $confPath" -ForegroundColor Cyan
Write-Host ""

# SMTP Configuration
$smtpConfig = @"

#################################### SMTP / Emailing ##########################
[smtp]
enabled = true
host = smtp.gmail.com:587
user = arunbalaji2323@gmail.com
# If the password contains # or ; you have to wrap it with triple quotes. Ex """#password;"""
password = alxqhdphjpvgdkgc
;cert_file =
;key_file =
skip_verify = false
from_address = arunbalaji2323@gmail.com
from_name = NL2PromQL Alerts
# EHLO identity in SMTP dialog (defaults to instance_name)
;ehlo_identity = dashboard.example.com
# SMTP startTLS policy (defaults to 'OpportunisticStartTLS')
startTLS_policy = MandatoryStartTLS

"@

# Check if custom.ini exists
if (Test-Path $customIniPath) {
    Write-Host "Found existing custom.ini" -ForegroundColor Yellow
    
    # Backup existing custom.ini
    $backupPath = "$customIniPath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item $customIniPath $backupPath -Force
    Write-Host "Created backup: $backupPath" -ForegroundColor Green
    
    # Read existing content
    $existingContent = Get-Content $customIniPath -Raw
    
    # Check if SMTP section already exists
    if ($existingContent -match '\[smtp\]') {
        Write-Host "SMTP section already exists. Updating..." -ForegroundColor Yellow
        
        # Remove existing [smtp] section
        $existingContent = $existingContent -replace '(?ms)\[smtp\].*?(?=\[|$)', ''
    }
    
    # Append new SMTP config
    $newContent = $existingContent.TrimEnd() + "`n" + $smtpConfig
    Set-Content -Path $customIniPath -Value $newContent -Force
    
} else {
    Write-Host "Creating new custom.ini..." -ForegroundColor Yellow
    Set-Content -Path $customIniPath -Value $smtpConfig -Force
}

Write-Host ""
Write-Host "SMTP configuration added successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Configuration file: $customIniPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "Restarting Grafana service..." -ForegroundColor Yellow

try {
    Restart-Service -Name "Grafana" -Force -ErrorAction Stop
    Write-Host "Grafana service restarted successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "=== Configuration Complete ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Open Grafana: http://localhost:3000" -ForegroundColor White
    Write-Host "2. Go to: Alerting -> Contact points" -ForegroundColor White
    Write-Host "3. Test the email contact point again" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "Failed to restart Grafana service: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please restart Grafana manually:" -ForegroundColor Yellow
    Write-Host "1. Open Services (services.msc)" -ForegroundColor White
    Write-Host "2. Find 'Grafana' service" -ForegroundColor White
    Write-Host "3. Right-click -> Restart" -ForegroundColor White
    Write-Host ""
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
