# Quick Start Guide - Dynamic Dashboard Testing

## Prerequisites Check

Before testing, ensure you have:
- ✅ Docker Desktop running
- ✅ Prometheus running on port 9090
- ✅ Grafana running on port 3000
- ✅ Windows Exporter running (for metrics)
- ✅ Backend running on port 4000
- ✅ Frontend running on port 5173

## Step 1: Start All Services

### Option A: Using Docker Compose (Recommended)
```powershell
cd c:\Users\arunb\Desktop\Prometheus_proj
docker-compose up -d
```

Wait 30 seconds for services to initialize.

### Option B: Manual Start
```powershell
# Terminal 1 - Backend
cd c:\Users\arunb\Desktop\Prometheus_proj\backend
npm run dev

# Terminal 2 - Frontend
cd c:\Users\arunb\Desktop\Prometheus_proj\frontend
npm run dev
```

## Step 2: Verify Services

Check each service:

```powershell
# Check Prometheus
curl http://localhost:9090/-/healthy

# Check Grafana
curl http://localhost:3000/api/health

# Check Backend
curl http://localhost:4000/health

# Check Frontend
# Open browser: http://localhost:5173
```

## Step 3: Test Dynamic Dashboard

### Test 1: CPU Query ✅
1. Open app: http://localhost:5173
2. Enter query: **"show cpu usage"**
3. Wait for PromQL generation
4. Click **Dashboard** button (purple)
5. ✅ Expected: Grafana opens with 3 graphs:
   - Your query
   - CPU Usage by Core
   - Average CPU Utilization

### Test 2: Memory Query ✅
1. Enter query: **"how much memory is available?"**
2. Click **Dashboard** button
3. ✅ Expected: Grafana opens with 3 graphs:
   - Your query
   - Memory Used %
   - Available Memory GB

### Test 3: Disk Query ✅
1. Enter query: **"disk read and write rate"**
2. Click **Dashboard** button
3. ✅ Expected: Grafana opens with 3 graphs:
   - Your query
   - Disk Read Rate
   - Disk Write Rate

### Test 4: Network Query ✅
1. Enter query: **"network traffic"**
2. Click **Dashboard** button
3. ✅ Expected: Grafana opens with 3 graphs:
   - Your query
   - Network RX Traffic
   - Network TX Traffic

### Test 5: Multi-Intent Query ✅
1. Enter query: **"show cpu and memory usage"**
2. Click **Dashboard** button
3. ✅ Expected: Grafana opens with 5 graphs:
   - Your query
   - CPU Usage by Core
   - Average CPU %
   - Memory Used %
   - Available Memory GB

### Test 6: Single Explore View ✅
1. Enter any query: **"show cpu usage"**
2. Click **Explore** button (orange)
3. ✅ Expected: Grafana opens with 1 graph:
   - Only your query (no context queries)

## Step 4: Visual Verification

In Grafana, verify:
- ✅ All graphs load automatically (no "Run Query" needed)
- ✅ Time range matches app setting (default 15 minutes)
- ✅ Graphs show colored lines/bars with data
- ✅ Legend shows metric labels
- ✅ Graphs refresh every 30 seconds

## Troubleshooting

### Issue: "Dashboard button does nothing"
**Solution:**
1. Check Grafana is running: http://localhost:3000
2. Check browser console for errors (F12)
3. Verify `VITE_GRAFANA_BASE_URL` in `.env` file

### Issue: "No data in graphs"
**Solution:**
1. Check Windows Exporter is running
2. Verify Prometheus is scraping: http://localhost:9090/targets
3. Check Prometheus has data: http://localhost:9090/graph

### Issue: "Grafana shows 'Data source not found'"
**Solution:**
1. Open Grafana: http://localhost:3000
2. Go to Configuration > Data sources
3. Verify "Prometheus" datasource exists
4. Check it points to http://prometheus:9090 (Docker) or http://localhost:9090 (local)

### Issue: "Frontend won't start"
**Solution:**
```powershell
cd c:\Users\arunb\Desktop\Prometheus_proj\frontend
rm -rf node_modules
npm install
npm run dev
```

### Issue: "Backend API error"
**Solution:**
1. Check Gemini API key is valid in `backend/.env`
2. Restart backend:
```powershell
cd c:\Users\arunb\Desktop\Prometheus_proj\backend
npm run dev
```

## Example Queries to Try

### CPU Queries
- "show cpu usage"
- "what is the processor utilization?"
- "display cpu cores performance"
- "cpu idle time"

### Memory Queries
- "how much memory is available?"
- "show ram usage"
- "memory consumption percentage"
- "free memory in gigabytes"

### Disk Queries
- "disk io rate"
- "storage read and write speed"
- "volume usage by drive"
- "disk throughput"

### Network Queries
- "network traffic by interface"
- "bandwidth usage"
- "show network activity"
- "bytes sent and received"

### System Queries
- "system uptime"
- "how many processes are running?"
- "system information"
- "os details"

### Combined Queries (Shows Multiple Panels!)
- "show cpu and memory usage"
- "display cpu, memory and disk metrics"
- "system overview with network traffic"
- "cpu, memory, disk and network performance"

## Success Criteria

✅ **Dashboard Button:**
- Opens Grafana in new tab
- Shows 3-7 graphs (depending on query)
- All graphs load automatically
- Graphs match query intent

✅ **Explore Button:**
- Opens Grafana in new tab
- Shows 1 graph (your query only)
- Graph loads automatically

✅ **Copy Button:**
- Copies PromQL to clipboard
- Shows "Copied!" confirmation

✅ **UI:**
- Dashboard button is purple
- Explore button is orange
- Help text explains both options
- Icons display correctly

## Performance

Expected response times:
- Query generation: 2-5 seconds
- Grafana page load: 1-2 seconds
- Graph rendering: 1-2 seconds
- **Total: 4-9 seconds from query to visualization**

## Next Steps

After successful testing:

1. **Push to Git:**
```powershell
cd c:\Users\arunb\Desktop\Prometheus_proj
git add .
git commit -m "Add dynamic dashboard feature with smart intent detection"
git push origin main
```

2. **Update README:**
- Add screenshots of Dashboard vs Explore views
- Document the new feature
- Add example queries

3. **Share with Team:**
- Demo the multi-intent queries
- Show CPU + Memory + Disk combined view
- Explain the intent detection logic

## Summary

The dynamic dashboard feature is now ready! It:
- ✅ Detects query intent automatically
- ✅ Shows only relevant metrics
- ✅ Supports multi-intent queries
- ✅ Provides both dashboard and explore views
- ✅ Requires no manual Grafana setup
- ✅ Works immediately with existing configuration

**Enjoy your smart, query-aware dashboards! 🚀📊**
