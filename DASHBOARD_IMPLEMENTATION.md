# Dynamic Dashboard Implementation Summary

## What Was Built

A smart dashboard system that analyzes user queries and displays only relevant Prometheus metrics in Grafana, eliminating the need for manually created dashboards.

## Key Features

### 1. Query Intent Detection
The system intelligently analyzes both natural language queries and generated PromQL to detect metric categories:
- **CPU**: Detects queries about processors, cores, CPU usage
- **Memory**: Detects queries about RAM, memory usage, available bytes
- **Disk**: Detects queries about storage, volumes, I/O operations
- **Network**: Detects queries about traffic, bandwidth, network interfaces
- **System**: Detects queries about uptime, processes, system info

### 2. Two Visualization Modes

#### Dashboard Button (Purple)
- Opens Grafana Explore with multiple queries
- Shows your original query PLUS context queries
- Displays 3-8 additional metrics based on query intent
- All graphs load simultaneously

**Example**: Query "CPU usage" shows:
1. Your query (CPU time total)
2. CPU Usage by Core
3. Average CPU Utilization

#### Explore Button (Orange)  
- Opens traditional Grafana Explore
- Shows only your single query
- For detailed investigation

### 3. Multi-Intent Support
If you ask "show CPU and memory usage", the dashboard includes:
- Your original query
- CPU context queries (2 additional)
- Memory context queries (2 additional)
- Total: 5 queries displayed together

## Files Modified

### 1. `frontend/src/utils/grafanaUtils.js`
**New Functions:**
```javascript
// Detects what metrics the user is interested in
detectQueryIntent(naturalQuery, promqlQuery)

// Generates multi-query Explore URL with context
generateGrafanaDashboardUrl(naturalQuery, promqlQuery, lookbackMinutes)

// Renamed from generateGrafanaUrl for clarity
generateGrafanaExploreUrl(promqlQuery, lookbackMinutes)
```

**Context Queries Added:**

**CPU Intent:**
- `100 - (rate(windows_cpu_time_total{mode="idle"}[5m]) * 100)` → CPU by Core
- `100 - (avg(rate(windows_cpu_time_total{mode="idle"}[5m])) * 100)` → Average CPU

**Memory Intent:**
- `100 - ((windows_os_physical_memory_free_bytes / windows_cs_physical_memory_bytes) * 100)` → Memory %
- `windows_os_physical_memory_free_bytes / 1024^3` → Available GB

**Disk Intent:**
- `rate(windows_logical_disk_read_bytes_total[5m])` → Read Rate
- `rate(windows_logical_disk_write_bytes_total[5m])` → Write Rate

**Network Intent:**
- `rate(windows_net_bytes_received_total[5m]) * 8` → RX Traffic
- `rate(windows_net_bytes_sent_total[5m]) * 8` → TX Traffic

**System Intent:**
- `windows_os_processes` → Process Count
- `time() - windows_system_system_up_time` → Uptime

### 2. `frontend/src/components/PromQLDisplay.jsx`
**Changes:**
- Added `LayoutDashboard` icon import
- Added `handleOpenDashboard()` function
- Split Grafana button into two buttons: Dashboard & Explore
- Updated help text with descriptions of both options
- Dashboard button styled purple, Explore button orange

**New UI:**
```
[Dashboard 📊] [Explore 🔗] [Copy 📋]
```

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│ User Query: "show cpu usage"                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Intent Detection                                            │
│ • Analyzes: "show cpu usage"                                │
│ • Analyzes: Generated PromQL                                │
│ • Detects: intent.cpu = true                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Query Generation                                            │
│ 1. User's Query (rate of cpu_time_total)                    │
│ 2. CPU by Core Query                                        │
│ 3. Average CPU Query                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ URL Generation                                              │
│ Creates Grafana Explore URL with all 3 queries encoded     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Grafana Display                                             │
│ Opens in new tab with all 3 graphs visible                 │
└─────────────────────────────────────────────────────────────┘
```

## Example Scenarios

### Scenario 1: Simple CPU Query
**User Input:** "show cpu usage"
**System Detects:** CPU intent
**Dashboard Shows:**
1. Your query graph
2. CPU Usage by Core graph
3. Average CPU % graph

### Scenario 2: Memory Query
**User Input:** "how much memory is available?"
**System Detects:** Memory intent
**Dashboard Shows:**
1. Your query graph
2. Memory Used % graph
3. Available Memory GB graph

### Scenario 3: Complex Multi-Intent Query
**User Input:** "show cpu, memory and disk usage"
**System Detects:** CPU + Memory + Disk intent
**Dashboard Shows:**
1. Your query graph
2. CPU by Core
3. Average CPU %
4. Memory Used %
5. Available Memory GB
6. Disk Read Rate
7. Disk Write Rate

**Total: 7 graphs displayed together!**

## Testing Instructions

### Step 1: Start All Services
```powershell
cd c:\Users\arunb\Desktop\Prometheus_proj
docker-compose up -d
```

### Step 2: Start Frontend (if not using Docker)
```powershell
cd frontend
npm run dev
```

### Step 3: Test Queries

**Test CPU:**
- Query: "show cpu usage"
- Click Dashboard button
- Verify 3 graphs appear (your query + 2 CPU context)

**Test Memory:**
- Query: "memory available"
- Click Dashboard button
- Verify 3 graphs appear (your query + 2 memory context)

**Test Multi-Intent:**
- Query: "show cpu and memory usage"
- Click Dashboard button
- Verify 5 graphs appear (your query + 2 CPU + 2 memory)

**Test Single Query:**
- Query: "show cpu usage"
- Click Explore button
- Verify only 1 graph appears (just your query)

## Advantages Over Previous Approach

### ❌ Old Approach (Undone by User)
- Required manual dashboard JSON creation
- Static dashboard with all panels always visible
- Needed Grafana provisioning setup
- Required dashboard import
- Not query-aware

### ✅ New Approach
- No manual dashboard creation needed
- Dynamic panels based on query
- Uses standard Grafana Explore (no import needed)
- Intelligent intent detection
- Query-aware visualization

## Technical Benefits

1. **No Dashboard Files**: Everything generated dynamically via URL
2. **No Provisioning**: Uses existing Prometheus datasource
3. **No Import**: Works immediately without setup
4. **Stateless**: Each query generates fresh view
5. **URL-Based**: Shareable links for specific queries
6. **Multi-Query Support**: Grafana Explore supports multiple queries natively

## User Experience

**Before:**
1. Enter query
2. Get PromQL
3. Click Grafana button
4. See single graph in Explore
5. Manually add more queries if needed

**After:**
1. Enter query
2. Get PromQL
3. Click **Dashboard** button → See 3-7 relevant graphs instantly
4. OR Click **Explore** button → See single graph for deep dive

## Limitations & Future Work

### Current Limitations
1. Uses Grafana Explore (not a persistent dashboard)
2. Cannot save configurations
3. Limited to pre-defined context queries
4. Requires Windows Exporter metrics

### Future Enhancements
1. Add dashboard save functionality via Grafana API
2. Support custom metric patterns
3. Add GPU metrics support
4. Include alerting threshold recommendations
5. Support Kubernetes metrics
6. Add panel layout customization

## Configuration

No configuration needed! The feature works automatically if:
- ✅ Grafana is accessible at `VITE_GRAFANA_BASE_URL`
- ✅ Prometheus datasource named "Prometheus" exists
- ✅ Windows Exporter metrics are available

## Documentation

See `DYNAMIC_DASHBOARD.md` for:
- Detailed usage instructions
- Complete list of supported queries
- Example queries for each metric type
- Architecture diagrams
- Troubleshooting guide

## Success Criteria

✅ Intent detection works for all 5 categories (CPU, Memory, Disk, Network, System)
✅ Dashboard button generates multi-query Explore URL
✅ Explore button generates single-query URL
✅ Multiple intents are detected simultaneously
✅ Context queries are relevant to detected intent
✅ All queries use same time range
✅ Grafana opens in new tab with queries pre-loaded
✅ No manual dashboard import required
✅ Works with existing Grafana setup

## Deployment

The feature is ready to use! Just:
1. Start your services: `docker-compose up -d`
2. Open the app: `http://localhost:5173`
3. Enter a query and click the **Dashboard** button

No additional setup, configuration, or Grafana provisioning needed!
