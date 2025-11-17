# Grafana Integration Setup

This guide explains how to set up Grafana with Prometheus and enable the "Open in Grafana" feature in the application.

## Overview

Grafana is an optional but powerful addition to this project. While the core application provides visualization capabilities, Grafana offers:

- Advanced dashboarding features
- More chart types and customization
- Alerting capabilities
- Pre-built dashboards for Windows Exporter
- Query history and saved queries

## Prerequisites

- Prometheus running on `http://localhost:9090`
- Windows Exporter configured and scraped by Prometheus

## Installation on Windows

### Option 1: Download Binary (Recommended)

1. Download Grafana from the official website:
   ```
   https://grafana.com/grafana/download?platform=windows
   ```

2. Extract the ZIP file to a location like `C:\grafana`

3. Navigate to the bin directory and run:
   ```powershell
   cd C:\grafana\bin
   .\grafana-server.exe
   ```

4. Grafana will start on `http://localhost:3000`

### Option 2: Windows Installer

1. Download the Windows installer (`.msi`) from Grafana's website

2. Run the installer and follow the prompts

3. Grafana will be installed as a Windows service and start automatically

### Option 3: Chocolatey

If you have Chocolatey installed:

```powershell
choco install grafana
```

## Initial Grafana Setup

### 1. Access Grafana

Open your browser and go to `http://localhost:3000`

**Default Credentials:**
- Username: `admin`
- Password: `admin`

You'll be prompted to change the password on first login.

### 2. Add Prometheus Data Source

1. Click on **Configuration** (gear icon) → **Data Sources**

2. Click **Add data source**

3. Select **Prometheus**

4. Configure the data source:
   - **Name**: `Prometheus`
   - **URL**: `http://localhost:9090`
   - **Access**: `Server (default)`

5. Scroll down and click **Save & Test**

6. You should see a green message: "Data source is working"

### 3. Import Windows Exporter Dashboard

Grafana has a community dashboard specifically for Windows Exporter metrics.

1. Click on **Dashboards** (four squares icon) → **Import**

2. Enter dashboard ID: `14694` (Windows Exporter Dashboard)

3. Click **Load**

4. Select **Prometheus** as the data source

5. Click **Import**

You now have a comprehensive Windows monitoring dashboard!

## Enable "Open in Grafana" Feature in Frontend

To enable the "Open in Grafana" button in the application:

### 1. Configure Frontend Environment

Edit `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_GRAFANA_BASE_URL=http://localhost:3000
```

### 2. Restart Frontend Dev Server

```bash
cd frontend
npm run dev
```

### 3. Test the Feature

1. Run a query in the application
2. After results appear, you'll see an **"Open in Grafana"** button
3. Click it to open Grafana Explore with:
   - Pre-filled PromQL query
   - Same time range as your query
   - Ready to execute or modify

## How It Works

When you click "Open in Grafana":

1. The app constructs a Grafana Explore URL
2. It includes your PromQL query and time range as URL parameters
3. Grafana opens in a new tab with the query pre-loaded
4. You can immediately run the query or further customize it in Grafana

## Common Grafana Dashboards for Windows

Here are some useful dashboard IDs to import:

| Dashboard ID | Name | Description |
|-------------|------|-------------|
| 14694 | Windows Exporter | Comprehensive Windows metrics |
| 12566 | Windows Node | Alternative Windows monitoring |
| 10467 | Windows Performance | Detailed performance metrics |

## Grafana Configuration Tips

### Change Port (if 3000 is in use)

Edit `C:\grafana\conf\defaults.ini` (or custom.ini):

```ini
[server]
http_port = 3001
```

Then update `frontend/.env`:

```env
VITE_GRAFANA_BASE_URL=http://localhost:3001
```

### Enable Anonymous Access (Development Only)

For easier access during development, edit `defaults.ini`:

```ini
[auth.anonymous]
enabled = true
org_role = Viewer
```

**⚠️ Warning**: Never enable anonymous access in production!

### Persist Data

By default, Grafana stores data in `C:\grafana\data`. Ensure this directory is backed up if you have custom dashboards or settings.

## Troubleshooting

### Grafana Won't Start

**Check if port 3000 is in use:**

```powershell
netstat -ano | findstr :3000
```

If it's in use, either close the application or change Grafana's port.

### "Data source is working" but No Data in Dashboards

1. Verify Prometheus is accessible:
   - Open `http://localhost:9090` in your browser
   - Check `/targets` page to ensure Windows Exporter is UP

2. Test a simple query in Grafana Explore:
   ```promql
   up{job="windows"}
   ```

3. Check time range - ensure you're looking at recent data

### "Open in Grafana" Opens Wrong URL

- Verify `VITE_GRAFANA_BASE_URL` in `frontend/.env` is correct
- Restart the frontend dev server after changing `.env`
- Check browser console for errors

### Grafana Button Not Appearing

- Ensure `VITE_GRAFANA_BASE_URL` is set in `frontend/.env`
- Restart the frontend: `npm run dev`
- Check that the environment variable is not commented out

## Running Grafana as a Windows Service

To run Grafana automatically on system startup:

### Using NSSM (Non-Sucking Service Manager)

1. Download NSSM from https://nssm.cc/download

2. Install Grafana as a service:
   ```powershell
   nssm install Grafana "C:\grafana\bin\grafana-server.exe"
   ```

3. Start the service:
   ```powershell
   nssm start Grafana
   ```

### Using Windows Task Scheduler

1. Open Task Scheduler
2. Create a new task
3. Set trigger to "At startup"
4. Set action to run `C:\grafana\bin\grafana-server.exe`
5. Configure to run whether user is logged in or not

## Advanced Features

### Creating Custom Dashboards

1. Click **Dashboards** → **New Dashboard**
2. Add panels with PromQL queries
3. Use variables for dynamic dashboards
4. Save and share with your team

### Setting Up Alerts

1. Open a panel in edit mode
2. Go to the **Alert** tab
3. Configure alert conditions
4. Set up notification channels (email, Slack, etc.)

### Exploring with Grafana

The Explore view (`/explore`) is perfect for:
- Ad-hoc query testing
- Query building and refinement
- Comparing multiple queries side-by-side
- Analyzing logs alongside metrics (if using Loki)

## Integration Architecture

```
┌──────────────┐
│   Frontend   │
│  (React)     │
└──────┬───────┘
       │
       │ 1. User query
       ↓
┌──────────────┐      ┌──────────────┐
│   Backend    │─────→│  Gemini AI   │
│  (Node.js)   │←─────│              │
└──────┬───────┘      └──────────────┘
       │
       │ 2. PromQL
       ↓
┌──────────────┐      ┌──────────────┐
│  Prometheus  │←─────│   Windows    │
│              │      │   Exporter   │
└──────┬───────┘      └──────────────┘
       │
       │ (Optional) 3. Open in Grafana
       ↓
┌──────────────┐
│   Grafana    │
│              │
└──────────────┘
```

## Resources

- [Grafana Documentation](https://grafana.com/docs/)
- [Grafana Dashboard Gallery](https://grafana.com/grafana/dashboards/)
- [PromQL Tutorial](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Windows Exporter Metrics](https://github.com/prometheus-community/windows_exporter)

## Summary

Grafana is a powerful complementary tool that enhances this project's capabilities. While the core React app provides quick, AI-powered metric visualization, Grafana offers deep analysis, dashboarding, and alerting for production monitoring scenarios.

The "Open in Grafana" integration provides a seamless bridge between both tools, letting you start with natural language queries and drill deeper when needed.

