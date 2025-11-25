# Dynamic Dashboard Feature

## Overview

The application now includes a **Smart Dynamic Dashboard** feature that intelligently displays only relevant metrics based on your natural language query.

## How It Works

### Query Intent Detection

When you submit a query, the system analyzes both your natural language input and the generated PromQL to detect what type of metrics you're interested in:

- **CPU Metrics**: Detects keywords like "cpu", "processor", "core"
- **Memory Metrics**: Detects keywords like "memory", "ram", "mem_", "available_bytes"
- **Disk Metrics**: Detects keywords like "disk", "storage", "volume", "read", "write", "io"
- **Network Metrics**: Detects keywords like "network", "net_", "nic", "traffic", "bandwidth"
- **System Metrics**: Detects keywords like "uptime", "process", "service", "system"

### Two Visualization Options

After generating a PromQL query, you'll see two Grafana buttons:

#### 1. **Dashboard Button** (Purple)
Opens a smart multi-query Explore view with:
- Your original query at the top
- Additional relevant context queries based on detected intent

**Example**: If you ask "show CPU usage", the dashboard will include:
- Your query: `rate(windows_cpu_time_total{mode="idle"}[5m]) * 100`
- CPU Usage by Core
- Average CPU Percentage

**Example**: If you ask "memory usage", the dashboard will include:
- Your query
- Memory Used Percentage
- Available Memory in GB

#### 2. **Explore Button** (Orange)
Opens Grafana Explore with just your single query for detailed investigation.

## Supported Metric Types

### CPU Metrics
When CPU intent is detected, additional queries show:
- CPU Usage by Core (per-core utilization)
- Average CPU % (overall system CPU)

### Memory Metrics
When Memory intent is detected, additional queries show:
- Memory Used % (percentage of total memory)
- Available Memory (in GB)

### Disk Metrics
When Disk intent is detected, additional queries show:
- Disk Read Rate (per volume)
- Disk Write Rate (per volume)

### Network Metrics
When Network intent is detected, additional queries show:
- Network RX (receive traffic in bits per second)
- Network TX (transmit traffic in bits per second)

### System Metrics
When System intent is detected, additional queries show:
- Process Count (number of running processes)
- System Uptime (in seconds)

## Multi-Intent Detection

If your query mentions multiple metric types (e.g., "show CPU and memory usage"), the dashboard will include relevant queries for all detected intents!

## Example Queries

Try these natural language queries to see the dynamic dashboard in action:

### CPU Queries
- "show cpu usage"
- "what is the processor utilization?"
- "display cpu cores"

### Memory Queries
- "how much memory is available?"
- "show ram usage"
- "memory consumption"

### Disk Queries
- "disk io rate"
- "storage read and write"
- "volume usage"

### Network Queries
- "network traffic"
- "bandwidth usage"
- "show network activity"

### System Queries
- "system uptime"
- "how many processes are running?"
- "system information"

### Combined Queries
- "show cpu and memory usage"
- "display cpu, memory and disk metrics"
- "system overview with network"

## Technical Implementation

### Files Modified

1. **`frontend/src/utils/grafanaUtils.js`**
   - Added `detectQueryIntent()` function for intent detection
   - Added `generateGrafanaDashboardUrl()` for smart dashboard URL generation
   - Renamed `generateGrafanaUrl()` to `generateGrafanaExploreUrl()` for clarity
   - Added context queries based on detected intent

2. **`frontend/src/components/PromQLDisplay.jsx`**
   - Added `LayoutDashboard` icon import
   - Added `handleOpenDashboard()` function
   - Updated UI with two buttons: "Dashboard" and "Explore"
   - Enhanced help text to explain both options

### Architecture

```
User Query → Intent Detection → Multiple PromQL Queries → Grafana Explore (Multi-Query View)
```

The system:
1. Analyzes your natural language query
2. Detects metric categories (CPU, Memory, Disk, Network, System)
3. Generates your requested PromQL query
4. Creates additional context queries for detected categories
5. Bundles all queries into a single Grafana Explore URL
6. Opens Grafana with all queries pre-loaded

## Benefits

✅ **Intelligent**: Only shows metrics relevant to your query
✅ **Comprehensive**: Provides context with additional related metrics
✅ **Fast**: All queries load simultaneously in Grafana
✅ **User-Friendly**: No need to manually create dashboards
✅ **Flexible**: Works with single or multi-intent queries

## Usage

1. Enter your natural language query in the app
2. Wait for PromQL generation
3. Click the **"Dashboard"** button (purple) to see smart multi-query view
4. OR click the **"Explore"** button (orange) for single-query investigation

## Requirements

- Grafana running on `http://localhost:3000`
- Prometheus data source configured in Grafana
- Windows Exporter metrics available in Prometheus

## Future Enhancements

Potential improvements:
- Add more metric categories (GPU, containers, services)
- Support for custom metric patterns
- Save favorite dashboard configurations
- Export dashboard as JSON for import
- Support for alerting thresholds
