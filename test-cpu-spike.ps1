# CPU Spike Test Script
# This will spike CPU usage to test your alerts
# Press Ctrl+C to stop

Write-Host "Starting CPU spike test..." -ForegroundColor Yellow
Write-Host "This will run for 5 minutes to trigger alerts" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop" -ForegroundColor Red
Write-Host ""

$endTime = (Get-Date).AddMinutes(5)

while ((Get-Date) -lt $endTime) {
    # Create CPU load
    1..100000 | ForEach-Object { 
        $result = $_ * $_ * $_
    }
    
    $remaining = ($endTime - (Get-Date)).TotalSeconds
    Write-Host "CPU spike running... $([math]::Round($remaining)) seconds remaining" -ForegroundColor Cyan
    Start-Sleep -Milliseconds 100
}

Write-Host "`nTest complete! Check your email for alerts." -ForegroundColor Green
