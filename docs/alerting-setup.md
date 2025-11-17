# Grafana Alerting Setup Guide

## 🚨 Overview

This guide explains how the Grafana alerting system works in your project and how to use it effectively.

## 📋 What's Been Configured

Your project now has a complete alerting system with:

✅ **Alert Rules** - 12 pre-configured alerts for system and service monitoring  
✅ **Contact Points** - Multiple notification channels (email, Slack, Teams, Discord, webhook)  
✅ **Notification Policies** - Smart routing based on severity  
✅ **Auto-Provisioning** - All alerts configured via code (Infrastructure as Code)

---

## 🏗️ How It Works

### Architecture

```
┌──────────────────┐
│  Windows System  │
│   (Your PC)      │
└────────┬─────────┘
         │ Metrics
         ▼
┌──────────────────┐
│Windows Exporter  │ (Port 9182)
└────────┬─────────┘
         │ Scrapes every 15s
         ▼
┌──────────────────┐
│   Prometheus     │ (Port 9090)
│  Stores Metrics  │
└────────┬─────────┘
         │ Query
         ▼
┌──────────────────┐      ┌──────────────────┐
│     Grafana      │─────→│  Contact Points  │
│  Alert Engine    │      │  (Email, Slack)  │
└──────────────────┘      └──────────────────┘
         │
         ▼
   Alert Rules
   Evaluate every 1min
```

### Alert Flow

1. **Prometheus** collects metrics from Windows Exporter every 15 seconds
2. **Grafana** queries Prometheus every 1 minute to evaluate alert rules
3. **Alert Rule** checks if condition is met (e.g., CPU > 80%)
4. **Wait Period** (e.g., 5 minutes) - confirms it's not a temporary spike
5. **Notification Policy** routes alert based on severity
6. **Contact Point** sends notification (email, Slack, etc.)
7. **Resolution** - when condition clears, sends "resolved" notification

---

## 🎯 Pre-Configured Alerts

### System Resource Alerts

| Alert Name | Trigger | Severity | Wait Time |
|------------|---------|----------|-----------|
| **High CPU Usage** | CPU > 80% | Warning | 5 minutes |
| **Critical CPU Usage** | CPU > 95% | Critical | 2 minutes |
| **Low Memory Available** | Free Memory < 10% | Warning | 5 minutes |
| **Critical Memory Shortage** | Free Memory < 5% | Critical | 2 minutes |
| **Low Disk Space** | Disk Free < 10% | Warning | 5 minutes |
| **Critical Disk Space** | Disk Free < 5% | Critical | 2 minutes |
| **High Network Errors** | Error rate > 10/s | Warning | 5 minutes |

### Service Health Alerts

| Alert Name | Trigger | Severity | Wait Time |
|------------|---------|----------|-----------|
| **Prometheus Down** | Service unreachable | Critical | 1 minute |
| **Windows Exporter Down** | No metrics scraped | Critical | 1 minute |
| **Backend API Down** | API unreachable | Critical | 1 minute |
| **High API Error Rate** | 5xx errors > 5/min | Warning | 5 minutes |

---

## ⚙️ Setup Instructions

### Step 1: Start Grafana with Alerting

```powershell
# Start the full stack with Grafana
docker-compose --profile with-grafana up -d

# Or rebuild if updating
docker-compose --profile with-grafana up -d --build
```

### Step 2: Access Grafana

1. Open browser to `http://localhost:3000`
2. Login with:
   - **Username:** `admin`
   - **Password:** `admin`
3. Change password when prompted (or skip)

### Step 3: Verify Alert Rules

1. In Grafana, click **Alerting** (bell icon) in left sidebar
2. Click **Alert rules**
3. You should see:
   - **System Monitoring** folder with 7 alerts
   - **Service Monitoring** folder with 4 alerts

All alerts are automatically loaded from the provisioning files!

### Step 4: Configure Notification Channel

Choose one or more options below:

---

## 📧 Option 1: Email Notifications

### Using Gmail

1. **Enable 2-Factor Authentication** on your Google account

2. **Create App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password

3. **Update docker-compose.yml:**

```yaml
environment:
  - GF_SMTP_ENABLED=true
  - GF_SMTP_HOST=smtp.gmail.com:587
  - GF_SMTP_USER=your-email@gmail.com
  - GF_SMTP_PASSWORD=your-16-char-app-password
  - GF_SMTP_FROM_ADDRESS=your-email@gmail.com
  - GF_SMTP_FROM_NAME=Grafana Alerts
```

4. **Update contact point:**

Edit `grafana/provisioning/alerting/contact-points.yml`:

```yaml
contactPoints:
  - orgId: 1
    name: email-alerts
    receivers:
      - uid: email-receiver
        type: email
        settings:
          addresses: your-email@gmail.com  # Your email here
        disableResolveMessage: false
```

5. **Restart Grafana:**

```powershell
docker-compose restart grafana
```

### Using Other Email Providers

| Provider | SMTP Host | Port |
|----------|-----------|------|
| Outlook | smtp.office365.com | 587 |
| Yahoo | smtp.mail.yahoo.com | 587 |
| Custom | your-smtp-server | 587/465 |

---

## 💬 Option 2: Slack Notifications

1. **Create Slack Incoming Webhook:**
   - Go to https://api.slack.com/apps
   - Click **Create New App** → **From scratch**
   - Name: "Grafana Alerts", select workspace
   - Click **Incoming Webhooks** → Activate
   - Click **Add New Webhook to Workspace**
   - Choose channel (e.g., #alerts)
   - Copy webhook URL

2. **Update contact-points.yml:**

```yaml
contactPoints:
  - orgId: 1
    name: slack-alerts
    receivers:
      - uid: slack-receiver
        type: slack
        settings:
          url: https://hooks.slack.com/services/YOUR/WEBHOOK/URL  # Paste here
          title: '{{ template "slack.default.title" . }}'
          text: '{{ template "slack.default.text" . }}'
```

3. **Update notification policy** to use Slack:

Edit `grafana/provisioning/alerting/policies.yml`:

```yaml
policies:
  - orgId: 1
    receiver: slack-alerts  # Change from email-alerts
```

4. **Restart Grafana:**

```powershell
docker-compose restart grafana
```

---

## 👥 Option 3: Microsoft Teams Notifications

1. **Create Teams Incoming Webhook:**
   - In Teams, go to your channel
   - Click **•••** → **Connectors** → **Configure**
   - Find "Incoming Webhook" → **Add**
   - Name: "Grafana Alerts"
   - Copy webhook URL

2. **Update contact-points.yml:**

```yaml
contactPoints:
  - orgId: 1
    name: teams-alerts
    receivers:
      - uid: teams-receiver
        type: teams
        settings:
          url: https://outlook.office.com/webhook/YOUR/WEBHOOK/URL  # Paste here
```

3. **Update notification policy:**

```yaml
receiver: teams-alerts
```

4. **Restart Grafana**

---

## 🎮 Option 4: Discord Notifications

1. **Create Discord Webhook:**
   - In Discord, go to Server Settings → Integrations
   - Click **Create Webhook**
   - Choose channel (e.g., #alerts)
   - Copy webhook URL

2. **Update contact-points.yml:**

```yaml
contactPoints:
  - orgId: 1
    name: discord-alerts
    receivers:
      - uid: discord-receiver
        type: discord
        settings:
          url: https://discord.com/api/webhooks/YOUR/WEBHOOK/URL  # Paste here
```

3. **Update policy and restart**

---

## 🔧 Option 5: Custom Webhook

For custom integrations (PagerDuty, Opsgenie, custom API):

```yaml
contactPoints:
  - orgId: 1
    name: webhook-alerts
    receivers:
      - uid: webhook-receiver
        type: webhook
        settings:
          url: http://your-api.com/alerts
          httpMethod: POST
```

The webhook will receive JSON payloads with alert details.

---

## 🎨 Customizing Alerts

### Modify Alert Thresholds

Edit `grafana/provisioning/alerting/alert-rules.yml`:

```yaml
# Change CPU threshold from 80% to 70%
- evaluator:
    params:
      - 70  # Changed from 80
    type: gt
```

### Change Wait Times

```yaml
for: 3m  # Changed from 5m - fires alert faster
```

### Add New Alert Rule

Add to `alert-rules.yml`:

```yaml
- uid: my-custom-alert
  title: My Custom Alert
  condition: C
  data:
    - refId: A
      datasourceUid: prometheus
      model:
        expr: 'your_promql_query_here'
    - refId: C
      datasourceUid: __expr__
      model:
        conditions:
          - evaluator:
              params:
                - 50  # Your threshold
              type: gt
        expression: A
        reducer: last
        type: reduce
  for: 5m
  annotations:
    description: 'Custom alert description'
    summary: 'Custom alert summary'
  labels:
    severity: warning
```

After making changes:

```powershell
docker-compose restart grafana
```

---

## 🔔 Notification Routing

### By Severity

Current setup routes alerts based on severity:

- **Critical** → Immediate (1 hour repeat interval)
- **Warning** → 5 minutes wait (12 hour repeat interval)
- **Info** → 10 minutes wait (24 hour repeat interval)

### Custom Routing

Edit `policies.yml` to route differently:

```yaml
routes:
  # CPU alerts go to specific channel
  - receiver: slack-alerts
    matchers:
      - alertname =~ ".*CPU.*"
    continue: false
  
  # Disk alerts go to email
  - receiver: email-alerts
    matchers:
      - alertname =~ ".*Disk.*"
```

### Multiple Notifications

Send critical alerts to multiple channels:

```yaml
- receiver: email-alerts
  matchers:
    - severity = critical
  continue: true  # Continue to next route

- receiver: slack-alerts
  matchers:
    - severity = critical
  continue: false
```

---

## 🧪 Testing Alerts

### Method 1: Manual Test from Grafana UI

1. Go to **Alerting** → **Contact points**
2. Find your contact point (e.g., `email-alerts`)
3. Click **Edit** (pencil icon)
4. Click **Test** button
5. Click **Send test notification**

This sends a test alert to verify your configuration works!

### Method 2: Trigger Real Alert

**Stress test CPU:**

```powershell
# Create CPU load
1..4 | ForEach-Object { 
    Start-Job -ScriptBlock { 
        while($true) { 
            $a = 0; 
            1..1000000 | ForEach-Object { $a += $_ } 
        } 
    } 
}

# Wait 5-7 minutes for alert to fire

# Stop the load
Get-Job | Stop-Job
Get-Job | Remove-Job
```

**Fill disk space (CAREFUL!):**

```powershell
# Creates a large file (adjust size)
fsutil file createnew C:\temp\testfile.tmp 10737418240  # 10GB

# Delete after testing
Remove-Item C:\temp\testfile.tmp
```

### Method 3: View Alert State

1. Go to **Alerting** → **Alert rules**
2. Check alert states:
   - **Normal** (green) - All good
   - **Pending** (orange) - Condition met, waiting
   - **Firing** (red) - Alert active, notification sent

---

## 📊 Viewing Alert History

### In Grafana

1. Click **Alerting** → **Alert rules**
2. Click on any alert name
3. View:
   - Current state
   - Recent evaluations
   - Alert history
   - Labels and annotations

### Alert Dashboard

Create a dashboard to visualize alerts:

1. **Dashboards** → **New** → **New Dashboard**
2. Add panel with query:
   ```promql
   ALERTS{alertstate="firing"}
   ```
3. Shows all currently firing alerts

---

## 🛠️ Troubleshooting

### Alerts Not Firing

**Check:**

1. **Prometheus has data:**
   - Open `http://localhost:9090`
   - Run query: `up{job="windows"}`
   - Should return `1`

2. **Grafana can query Prometheus:**
   - Go to **Connections** → **Data sources** → **Prometheus**
   - Click **Save & test**
   - Should show green success

3. **Alert rule syntax is valid:**
   - Go to **Alerting** → **Alert rules**
   - Check for error icons

4. **Check logs:**
   ```powershell
   docker-compose logs grafana | Select-String "alert"
   ```

### Notifications Not Sending

**Check:**

1. **Test contact point** (Method 1 above)

2. **For email:**
   - Verify SMTP settings in docker-compose.yml
   - Check spam folder
   - View Grafana logs:
     ```powershell
     docker-compose logs grafana | Select-String "email|smtp"
     ```

3. **For webhooks (Slack/Teams/Discord):**
   - Verify webhook URL is correct
   - Check if webhook is active in platform
   - Test webhook manually with curl:
     ```powershell
     curl -X POST -H "Content-Type: application/json" -d '{"text":"Test"}' YOUR_WEBHOOK_URL
     ```

### Alerts Firing Too Often

**Increase wait time:**

```yaml
for: 10m  # Increased from 5m
```

**Increase repeat interval:**

```yaml
repeat_interval: 24h  # Decreased notification frequency
```

---

## 🔐 Security Best Practices

1. **Change Grafana password:**
   ```yaml
   - GF_SECURITY_ADMIN_PASSWORD=use-strong-password-here
   ```

2. **Don't commit secrets:**
   - Keep webhook URLs in environment variables
   - Use `.env` file (already in `.gitignore`)

3. **Restrict access:**
   - Use Grafana's user management
   - Set up SSO for teams

4. **Monitor alert volume:**
   - Too many alerts = alert fatigue
   - Fine-tune thresholds
   - Use silences for maintenance windows

---

## 📈 Advanced Features

### Silences (Maintenance Mode)

To temporarily disable alerts:

1. Go to **Alerting** → **Silences**
2. Click **New silence**
3. Set matchers (e.g., `alertname = High CPU Usage`)
4. Set duration (e.g., 2 hours)
5. Click **Create silence**

Useful during:
- Scheduled maintenance
- System updates
- Known issues being worked on

### Alert Groups

Alerts are grouped by:
- `alertname` - All instances of same alert
- `severity` - Critical/Warning/Info

Prevents notification spam when multiple servers have same issue.

### Annotation Templating

Use Go templates in alert messages:

```yaml
annotations:
  description: 'CPU is at {{ $values.A.Value | humanize }}% on {{ $labels.instance }}'
```

Variables:
- `{{ $labels.labelname }}` - Prometheus label value
- `{{ $values.refId.Value }}` - Query result value
- `{{ $values.refId.Value | humanize }}` - Formatted value

---

## 📝 Common Use Cases

### 1. Alert During Business Hours Only

```yaml
routes:
  - receiver: email-alerts
    matchers:
      - severity = warning
    time_intervals:
      - business-hours
```

Define time interval in separate config.

### 2. Different Alerts for Different Teams

```yaml
routes:
  - receiver: devops-team
    matchers:
      - alertname =~ ".*Service.*"
  
  - receiver: sysadmin-team
    matchers:
      - alertname =~ ".*Disk.*|.*Memory.*"
```

### 3. Escalation

```yaml
routes:
  - receiver: on-call-engineer
    matchers:
      - severity = critical
    repeat_interval: 30m  # Repeat every 30 min until resolved
```

---

## 🎓 Understanding Alert States

| State | Description | What It Means |
|-------|-------------|---------------|
| **Normal** | Condition not met | System healthy |
| **Pending** | Condition met, waiting | Waiting for `for` duration |
| **Firing** | Condition met + wait time passed | Alert active, notifying |
| **No Data** | Query returns no data | Check Prometheus scraping |
| **Error** | Query or evaluation failed | Check query syntax |

---

## 📚 Next Steps

1. **Configure your notification channel** (email, Slack, etc.)
2. **Test alerts** with manual test or stress test
3. **Customize thresholds** based on your system
4. **Create custom alerts** for your specific needs
5. **Set up alert dashboard** for visualization
6. **Configure silences** for maintenance windows

---

## 🆘 Getting Help

If alerts aren't working:

1. Check Grafana logs: `docker-compose logs grafana`
2. Verify Prometheus data: `http://localhost:9090`
3. Test contact points from Grafana UI
4. Check network connectivity for webhooks
5. Review this guide's troubleshooting section

---

## 📖 Additional Resources

- [Grafana Alerting Documentation](https://grafana.com/docs/grafana/latest/alerting/)
- [Prometheus Querying Basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Alert Rule Examples](https://grafana.com/docs/grafana/latest/alerting/alerting-rules/)
- [Notification Templates](https://grafana.com/docs/grafana/latest/alerting/manage-notifications/template-notifications/)

---

**🎉 Your alerting system is ready! Configure a notification channel and start monitoring your system proactively.**
