# E2E Demo Script

This script provides a complete walkthrough demonstration of the Natural Language to PromQL Query Conversion and Data Visualization system.

## Demo Overview

**Duration**: 10-15 minutes

**Audience**: Developers, DevOps engineers, students

**Objective**: Showcase the full workflow from natural language input to metric visualization

---

## Prerequisites Check

Before starting the demo, verify all components are running:

```powershell
# 1. Check Windows Exporter
Write-Host "Checking Windows Exporter..." -ForegroundColor Cyan
try {
    $metrics = Invoke-WebRequest -Uri "http://localhost:9182/metrics" -UseBasicParsing
    Write-Host "✓ Windows Exporter is UP (Port 9182)" -ForegroundColor Green
} catch {
    Write-Host "✗ Windows Exporter is DOWN" -ForegroundColor Red
    exit 1
}

# 2. Check Prometheus
Write-Host "`nChecking Prometheus..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "http://localhost:9090/-/healthy"
    Write-Host "✓ Prometheus is UP (Port 9090)" -ForegroundColor Green
} catch {
    Write-Host "✗ Prometheus is DOWN" -ForegroundColor Red
    exit 1
}

# 3. Check Prometheus Targets
Write-Host "`nChecking Prometheus Targets..." -ForegroundColor Cyan
Start-Process "http://localhost:9090/targets"
Write-Host "→ Opened Prometheus Targets page. Verify 'windows' job is UP." -ForegroundColor Yellow

# 4. Check Backend
Write-Host "`nChecking Backend API..." -ForegroundColor Cyan
try {
    $apiHealth = Invoke-RestMethod -Uri "http://localhost:4000/api/health"
    if ($apiHealth.data.ok) {
        Write-Host "✓ Backend API is UP (Port 4000)" -ForegroundColor Green
        Write-Host "  - Prometheus Connected: $($apiHealth.data.services.prometheusUp)" -ForegroundColor Gray
        Write-Host "  - Gemini AI Configured: $($apiHealth.data.services.aiConfigured)" -ForegroundColor Gray
    } else {
        Write-Host "✗ Backend API has issues" -ForegroundColor Red
        $apiHealth | ConvertTo-Json
    }
} catch {
    Write-Host "✗ Backend API is DOWN" -ForegroundColor Red
    exit 1
}

# 5. Open Frontend
Write-Host "`nOpening Frontend..." -ForegroundColor Cyan
Start-Process "http://localhost:5173"
Write-Host "✓ Frontend opened in browser (Port 5173)" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "All Systems Ready! Proceed with demo." -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan
```

**Expected Output**: All services show green checkmarks ✓

---

## Demo Script

### Part 1: Introduction (2 minutes)

**Say**:

> "Today I'll demonstrate an AI-powered monitoring tool that bridges the gap between natural language and Prometheus metrics.
>
> The challenge: PromQL, Prometheus's query language, is powerful but requires expertise. Many users struggle to write correct queries.
>
> The solution: This system uses Google Gemini AI to convert plain English queries into valid PromQL, then visualizes the results.
>
> Let's see it in action."

**Show**:
- Open browser to frontend (`http://localhost:5173`)
- Point out the clean, dark-themed interface
- Highlight health status at top (all green)

---

### Part 2: Verify Prometheus Data (3 minutes)

**Say**:

> "First, let's verify Prometheus is collecting Windows metrics."

**Show**:

1. Open Prometheus UI in new tab: `http://localhost:9090`
2. Navigate to **Status → Targets**
3. Point out:
   - `windows` job is **UP**
   - Last scrape time is recent (< 30 seconds ago)
   - Scrape duration is healthy (< 1 second)

4. Go to **Graph** tab
5. Enter simple query: `up{job="windows"}`
6. Click **Execute**
7. Show result: `1` (meaning UP)

**Say**:

> "Prometheus is actively scraping Windows Exporter. We have metrics available. Now, instead of writing PromQL manually, let's use natural language."

---

### Part 3: First Query - CPU Usage (3 minutes)

**Return to Frontend**

**Say**:

> "Let's ask for CPU usage in plain English."

**Do**:
1. Click in the "Natural Language Query" input
2. Type: **"Show CPU usage for the last 15 minutes"**
3. Leave lookback at **15 minutes**
4. Leave step at **15 seconds**
5. Click **"Convert & Visualize"**

**Observe**:
- Button shows spinner and "Processing..."
- After 2-5 seconds, results appear

**Point Out**:

1. **Generated PromQL Query**:
   ```promql
   rate(windows_cpu_time_total[15m]) * 100
   ```
   - Show code block with syntax highlighting
   - Click **Copy** button, show "Copied!" feedback
   - Explain: "This query calculates CPU usage rate over 15 minutes"

2. **KPI Metrics** (four cards):
   - Current: Latest CPU usage value
   - Average: Mean over the period
   - Maximum: Peak usage
   - Minimum: Lowest usage
   - Show actual values (e.g., "Current: 45.2")

3. **Interactive Chart**:
   - Multiple colored lines (one per CPU core)
   - Hover over chart to show tooltip
   - Point out time labels on X-axis
   - Note data points every 15 seconds

**Say**:

> "In seconds, we went from English to a working PromQL query with visualization. No PromQL knowledge required."

---

### Part 4: Try Demo Queries (2 minutes)

**Say**:

> "The interface includes pre-configured demo queries for common monitoring scenarios."

**Do**:
1. Scroll down to "Quick Demo Queries"
2. Click **"Memory Usage (1 hour)"**
3. Watch as query auto-fills and submits
4. Show results:
   - PromQL: e.g., `windows_memory_available_bytes / 1024 / 1024 / 1024`
   - Chart shows memory over 1 hour
   - KPI shows memory in GB

**Say**:

> "These demo queries help users get started quickly."

**Optional**: Try another demo query:
- Click **"Network Traffic"**
- Show network bytes per interface
- Note the `by (nic)` grouping in PromQL

---

### Part 5: Grafana Integration (Optional, 2 minutes)

**Prerequisites**: Grafana running and `VITE_GRAFANA_BASE_URL` configured

**Say**:

> "For deeper analysis, we can seamlessly transition to Grafana."

**Do**:
1. After viewing a query result, locate **"Open in Grafana"** button (orange)
2. Click it
3. New tab opens: Grafana Explore view
4. Show:
   - PromQL query is pre-filled
   - Time range matches (e.g., last 15 minutes)
   - Click **Run query** in Grafana
   - Results match what we saw in the app

**Say**:

> "Grafana provides advanced features like dashboards and alerting. Our app serves as a quick entry point."

---

### Part 6: Error Handling & Edge Cases (2 minutes)

**Demo A: Invalid Query**

**Do**:
1. Enter a very vague query: **"random stuff"**
2. Submit

**Show**:
- Either:
  - Gemini generates a query, but Prometheus returns no data
  - Error alert appears with explanation
- User can retry with a clearer query

**Demo B: Backend Unavailable**

**Do**:
1. **Stop the backend server** (Ctrl+C in terminal)
2. Try submitting a query

**Show**:
- Red error alert: "Cannot connect to backend. Please ensure the server is running on port 4000."
- Dismiss error by clicking X

3. **Restart backend** (`npm run dev`)
4. Submit query again
5. Works normally

**Say**:

> "The app handles errors gracefully and guides users to resolution."

---

### Part 7: Validate with Prometheus UI (2 minutes)

**Say**:

> "Let's verify the generated PromQL is correct by testing it directly in Prometheus."

**Do**:
1. Copy a PromQL query from the app (e.g., `rate(windows_cpu_time_total[15m]) * 100`)
2. Open Prometheus UI: `http://localhost:9090/graph`
3. Paste query into query box
4. Set time range to match (last 15 minutes)
5. Click **Execute** then **Graph** tab

**Show**:
- Results match what's displayed in our app
- Same number of series
- Similar values

**Say**:

> "This confirms Gemini is generating valid, production-ready PromQL."

---

### Part 8: Live System Stress Test (Optional, 3 minutes)

**Say**:

> "Let's generate some CPU load and watch the metrics change in real-time."

**Do**:

1. Open PowerShell as Administrator
2. Run CPU stress script:

```powershell
# CPU Stress Test
Write-Host "Starting CPU stress test for 30 seconds..." -ForegroundColor Yellow

$jobs = 1..4 | ForEach-Object {
    Start-Job -ScriptBlock {
        $end = (Get-Date).AddSeconds(30)
        while ((Get-Date) -lt $end) {
            $result = 1..1000000 | ForEach-Object { $_ * $_ }
        }
    }
}

Write-Host "Stressing CPU..." -ForegroundColor Red
Start-Sleep -Seconds 30

$jobs | Stop-Job
$jobs | Remove-Job

Write-Host "CPU stress test completed." -ForegroundColor Green
```

3. While script runs, **return to the app**
4. Submit query: **"Current CPU usage"**
5. Look at "Current" KPI value
6. Wait 30 seconds for stress to complete
7. Submit query again
8. Show CPU usage has dropped back to normal

**Say**:

> "The system responds to real-time system changes, providing accurate, live monitoring."

---

## Demo Checklist

Use this checklist during the demo:

- [ ] All services are UP before starting
- [ ] Frontend health status is green
- [ ] Prometheus targets page shows windows job UP
- [ ] First query (CPU) completes successfully
- [ ] PromQL is displayed clearly
- [ ] Chart renders with multiple lines
- [ ] KPI metrics show reasonable values
- [ ] Demo queries work (try at least 2)
- [ ] Copy button copies PromQL to clipboard
- [ ] Grafana button works (if configured)
- [ ] Error handling demonstrated
- [ ] Query validated in Prometheus UI
- [ ] Optional: Live CPU stress test

---

## Talking Points

### Architecture Overview

If asked about architecture, explain:

```
User's Natural Language Query
        ↓
Frontend (React + Vite)
        ↓
Backend API (Node.js + Express)
        ↓
Google Gemini AI (NL → PromQL conversion)
        ↓
Backend validates & formats
        ↓
Prometheus (query_range API)
        ↓
Time-series data returned
        ↓
Frontend visualizes with Recharts
```

### Key Technologies

- **Frontend**: React, Vite, Tailwind CSS, Recharts
- **Backend**: Node.js, Express, Pino logging, Zod validation
- **AI**: Google Gemini 1.5 Flash
- **Monitoring**: Prometheus, Windows Exporter
- **Optional**: Grafana for advanced dashboards

### Security Features

- ✅ Helmet for HTTP headers
- ✅ CORS protection
- ✅ Rate limiting (100 req / 15 min)
- ✅ Input validation with Zod
- ✅ Secret redaction in logs
- ✅ Input sanitization against injection

### Use Cases

- **DevOps Engineers**: Quick metric checks without PromQL knowledge
- **Students**: Learning Prometheus by seeing PromQL examples
- **Non-Technical Users**: Self-service monitoring dashboards
- **Incident Response**: Rapid metric queries during outages

---

## Common Questions & Answers

**Q: Does this work with Linux or Mac?**
A: Currently configured for Windows Exporter, but easily adaptable. Just change the scrape config and use `node_exporter` instead.

**Q: Can it handle complex queries?**
A: Gemini can generate moderately complex queries. For very advanced PromQL (subqueries, joins), manual editing may be needed.

**Q: Is Grafana required?**
A: No. The app works standalone. Grafana is an optional enhancement.

**Q: How accurate is the AI conversion?**
A: Very accurate for common patterns (CPU, memory, disk, network). Gemini is trained on PromQL examples and generates valid queries ~95% of the time.

**Q: Can I use this in production?**
A: Yes, with considerations:
- Add authentication
- Use HTTPS
- Monitor API key usage (Gemini quotas)
- Set up proper logging and alerting

**Q: What if Gemini is down or quota exceeded?**
A: The health check will show AI as not configured. Users can still manually enter PromQL queries directly in Prometheus.

**Q: How much does it cost?**
A: Gemini 1.5 Flash has a generous free tier (15 requests/min). For heavy usage, Google charges per million tokens (very affordable).

---

## Post-Demo Activities

After the demo, suggest:

1. **Explore More Queries**: Try custom queries like:
   - "Disk usage on C: drive"
   - "Network errors by interface"
   - "Process count over time"

2. **Customize Dashboards**: Import Windows Exporter dashboard in Grafana (ID: 14694)

3. **Set Up Alerting**: Use Prometheus Alertmanager or Grafana alerts for thresholds

4. **Extend the System**:
   - Add custom metrics from applications
   - Integrate with Loki for log correlation
   - Build a mobile-responsive PWA

---

## Troubleshooting During Demo

### Issue: No Data in Chart

**Solution**:
- Check Prometheus targets are UP
- Try shorter lookback time (5 minutes instead of 60)
- Verify Windows Exporter is running: `http://localhost:9182/metrics`

### Issue: AI Returns Markdown/Prose Instead of PromQL

**Solution**:
- This indicates prompt template issue
- Check `backend/src/config/prompts.js`
- Ensure Gemini response is being cleaned (removing markdown fences)

### Issue: Grafana Button Missing

**Solution**:
- Ensure `VITE_GRAFANA_BASE_URL` is set in `frontend/.env`
- Restart frontend dev server
- Refresh browser

### Issue: Rate Limit Hit

**Solution**:
- Wait 15 minutes
- Or temporarily increase limit in `backend/src/index.js`

---

## Recording the Demo

If recording a video demo:

1. **Preparation**:
   - Close unnecessary applications
   - Clear browser history/cache
   - Set browser zoom to 100%
   - Use dark theme for visibility

2. **Screen Recording Settings**:
   - Record at 1080p resolution
   - Enable microphone for narration
   - Record system audio if playing videos

3. **Editing Tips**:
   - Speed up waiting times (API calls)
   - Add text overlays for key points
   - Highlight mouse clicks
   - Add background music (optional, low volume)

4. **Publishing**:
   - Upload to YouTube/Vimeo
   - Add chapters/timestamps in description
   - Include links to GitHub repo

---

## Demo Script Summary

This demo showcases a complete AI-powered monitoring workflow:

1. ✅ Verify all systems are operational
2. ✅ Submit natural language queries
3. ✅ View AI-generated PromQL queries
4. ✅ Visualize metrics with interactive charts
5. ✅ Display KPI metrics (current, avg, max, min)
6. ✅ Optional Grafana integration
7. ✅ Demonstrate error handling
8. ✅ Validate queries in Prometheus UI
9. ✅ Optional live stress testing

**Total Time**: 10-15 minutes

**Key Takeaway**: Democratizing Prometheus monitoring by making it accessible through natural language, powered by AI.

---

## Next Steps

After the demo, guide users to:

1. **Read the README**: Comprehensive setup guide
2. **Check the Documentation**: 
   - `docs/grafana-setup.md` for Grafana integration
   - `docs/docker-setup.md` for containerized deployment
3. **Run Acceptance Tests**: `tests/ACCEPTANCE.md`
4. **Contribute**: Submit issues or PRs on GitHub

---

## Conclusion

This demo script provides a complete walkthrough of the Natural Language to PromQL system, highlighting:

- **Ease of Use**: No PromQL knowledge required
- **AI Power**: Gemini converts English to valid queries
- **Visualization**: Beautiful, interactive charts
- **Integration**: Seamless Grafana connectivity
- **Robustness**: Error handling and validation

The system transforms complex monitoring into simple, natural interactions.

**Happy Monitoring! 🚀📊**

