# Quick Start: Email Alerts Setup

## 1️⃣ Generate Gmail App Password

1. **Go to**: https://myaccount.google.com/apppasswords
2. **Select**: Mail → Other (Custom name) → "NL2PromQL"
3. **Copy** the 16-character password (e.g., `abcd efgh ijkl mnop`)

## 2️⃣ Update `.env` File

Open `.env` and replace with your details:

```env
SMTP_HOST=smtp.gmail.com:587
SMTP_USER=your-actual-email@gmail.com
SMTP_PASSWORD=abcdefghijklmnop
SMTP_FROM=your-actual-email@gmail.com
```

## 3️⃣ Update Email Address in Contact Points

Edit: `grafana/provisioning/alerting/contact-points.yaml`

Find and replace (2 places):
```yaml
addresses: your-email@example.com
```
With:
```yaml
addresses: your-actual-email@gmail.com
```

## 4️⃣ Restart Grafana

```powershell
docker-compose restart grafana
```

## 5️⃣ Test Alerts

1. Open: http://localhost:3000
2. Login: admin / admin
3. Go to: **Alerting** → **Contact points**
4. Click: **Email Notifications** → **Test**
5. Check your inbox!

## ✅ You're Done!

Alerts will now email you when:
- CPU > 80% (warning) or > 95% (critical)
- Memory > 85% (warning) or > 95% (critical)  
- Disk > 80% (warning) or > 90% (critical)
- Network errors > 10/sec
- Service goes down

See `ALERTING_SETUP.md` for full documentation.
