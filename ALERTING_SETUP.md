# Alerting Configuration Guide

## Overview
This system provides automated email alerts for critical system metrics monitored by Prometheus and Grafana.

## Alert Rules Configured

### CPU Alerts
1. **High CPU Usage** (Warning)
   - Threshold: CPU > 80%
   - Duration: 5 minutes
   - Action: Email notification

2. **Critical CPU Usage** (Critical)
   - Threshold: CPU > 95%
   - Duration: 2 minutes
   - Action: Immediate email notification

### Memory Alerts
1. **High Memory Usage** (Warning)
   - Threshold: Memory > 85%
   - Duration: 5 minutes
   - Action: Email notification

2. **Critical Memory Usage** (Critical)
   - Threshold: Memory > 95%
   - Duration: 2 minutes
   - Action: Immediate email notification

### Disk Alerts
1. **Low Disk Space** (Warning)
   - Threshold: Disk > 80% full
   - Duration: 10 minutes
   - Action: Email notification

2. **Critical Disk Space** (Critical)
   - Threshold: Disk > 90% full
   - Duration: 5 minutes
   - Action: Immediate email notification

### Network Alerts
1. **High Network Errors** (Warning)
   - Threshold: > 10 errors/sec
   - Duration: 5 minutes
   - Action: Email notification

### System Alerts
1. **Service Down** (Critical)
   - Threshold: Windows Exporter not responding
   - Duration: 1 minute
   - Action: Immediate email notification

## Email Configuration

### For Gmail:

1. **Enable 2-Factor Authentication** on your Gmail account

2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "NL2PromQL Alerts"
   - Copy the 16-character password

3. **Update .env file**:
```env
# Add these lines to your .env file
SMTP_HOST=smtp.gmail.com:587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SMTP_FROM=your-email@gmail.com
```

### For Other Email Providers:

#### Microsoft Outlook/Office 365:
```env
SMTP_HOST=smtp.office365.com:587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
SMTP_FROM=your-email@outlook.com
```

#### Yahoo Mail:
```env
SMTP_HOST=smtp.mail.yahoo.com:587
SMTP_USER=your-email@yahoo.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@yahoo.com
```

#### Custom SMTP Server:
```env
SMTP_HOST=smtp.yourserver.com:587
SMTP_USER=your-username
SMTP_PASSWORD=your-password
SMTP_FROM=alerts@yourserver.com
```

## Setup Instructions

### Step 1: Configure Email Settings

Edit the `.env` file in the project root:

```bash
# Email Configuration for Grafana Alerts
SMTP_HOST=smtp.gmail.com:587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
```

### Step 2: Update Contact Point

Edit `grafana/provisioning/alerting/contact-points.yaml`:

Replace `your-email@example.com` with your actual email address (appears in 2 places):

```yaml
settings:
  addresses: your-actual-email@gmail.com  # <-- Update this
```

### Step 3: Restart Grafana

```powershell
docker-compose restart grafana
```

Or if running full stack:

```powershell
docker-compose down
docker-compose --profile with-grafana up -d
```

### Step 4: Verify Email Configuration

1. Open Grafana: http://localhost:3000
2. Login (admin/admin)
3. Go to **Alerting** → **Contact points**
4. Click **"Email Notifications"**
5. Click **"Test"** button
6. Check your email inbox

## Alert Notification Behavior

### Warning Alerts (Orange)
- **Group Wait**: 30 seconds (waits for related alerts)
- **Group Interval**: 5 minutes (groups alerts together)
- **Repeat Interval**: 4 hours (sends reminder if still firing)

### Critical Alerts (Red)
- **Group Wait**: 10 seconds (faster response)
- **Group Interval**: 2 minutes (frequent updates)
- **Repeat Interval**: 30 minutes (more frequent reminders)

## Email Format

### Subject Line:
```
[FIRING:1] High CPU Usage (System Alerts warning)
```

### Email Body:
```
Alert: High CPU Usage
Status: Firing
Severity: warning
Category: cpu

Description: CPU usage is above 80% (current: 87.5%)
Summary: High CPU usage detected on localhost:9182

Started: 2025-11-21 14:30:15
```

## Testing Alerts

### Test CPU Alert:
Run a CPU-intensive task to trigger high CPU usage:
```powershell
# This will spike CPU to test the alert
while($true) { $result = 1..1000000 | % { $_ * 2 } }
# Press Ctrl+C to stop
```

### Test Memory Alert:
Open multiple applications or use a memory stress tool

### Test Disk Alert:
Create large files to fill up disk space

### Test Service Down Alert:
Stop the Windows Exporter service

## Viewing Alerts in Grafana

1. **Open Grafana**: http://localhost:3000
2. **Navigate**: Alerting → Alert rules
3. **View**: See all configured alert rules
4. **Status**: Check which alerts are currently firing

## Customizing Alerts

### Change Thresholds:

Edit `grafana/provisioning/alerting/alerts.yaml`:

```yaml
- evaluator:
    params:
      - 80  # <-- Change this number (percentage)
    type: gt
```

### Add New Alert:

Copy an existing alert rule and modify:
- Change `uid` to unique value
- Update `title`
- Modify `expr` for different metric
- Adjust threshold in `params`

### Change Email Frequency:

Edit `grafana/provisioning/alerting/contact-points.yaml`:

```yaml
repeat_interval: 4h  # <-- Change this (1h, 30m, etc.)
```

## Troubleshooting

### No Emails Received:

1. **Check SMTP settings** in docker-compose.yml
2. **Verify email address** in contact-points.yaml
3. **Test SMTP connection**:
   ```bash
   docker-compose logs grafana | grep -i smtp
   ```

4. **Check spam folder** in your email

5. **Verify Grafana logs**:
   ```powershell
   docker logs grafana
   ```

### Alerts Not Firing:

1. **Check Prometheus data**:
   - Open: http://localhost:9090
   - Query: Your alert expression
   - Verify data exists

2. **Check alert rule status** in Grafana:
   - Go to: Alerting → Alert rules
   - Check: State column

3. **Verify datasource UID**:
   - Alerts use `datasourceUid: prometheus`
   - Check Prometheus is configured

### Gmail App Password Issues:

1. **Ensure 2FA is enabled** on Gmail account
2. **Generate new app password** if not working
3. **Use exact 16-character password** (no spaces)
4. **Check "Less secure app access"** is NOT enabled (use app password instead)

## Alert Silencing

To temporarily silence alerts:

1. Go to: **Alerting** → **Silences**
2. Click: **"+ New Silence"**
3. Add matcher: `severity=warning` or `alertname=High CPU Usage`
4. Set duration: 1h, 4h, 1d, etc.
5. Add comment explaining why
6. Click: **"Submit"**

## Best Practices

1. **Test alerts** before going to production
2. **Set appropriate thresholds** for your environment
3. **Don't alert on everything** - only critical issues
4. **Group related alerts** to avoid email spam
5. **Document custom alert rules** for team members
6. **Review and tune** alert thresholds regularly
7. **Set up multiple contact points** for different teams
8. **Use silence feature** during maintenance windows

## Alert States

- **Normal**: Metric is within acceptable range
- **Pending**: Threshold exceeded but waiting for duration
- **Firing**: Alert actively sending notifications
- **Resolved**: Metric returned to normal (sends resolution email)

## Files Created

```
grafana/provisioning/alerting/
├── alerts.yaml           # Alert rule definitions
└── contact-points.yaml   # Email notification settings
```

## Next Steps

1. ✅ Configure email settings in `.env`
2. ✅ Update email address in `contact-points.yaml`
3. ✅ Restart Grafana container
4. ✅ Test email notification
5. ✅ Monitor alerts in Grafana UI
6. ✅ Adjust thresholds as needed

## Support

For Grafana alerting documentation:
https://grafana.com/docs/grafana/latest/alerting/

For email configuration:
https://grafana.com/docs/grafana/latest/alerting/configure-notifications/
