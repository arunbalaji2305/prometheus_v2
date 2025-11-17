# Quick Start Guide

Get the Natural Language to PromQL project running in 5 minutes!

## Prerequisites

✅ **Windows Exporter** installed and running on port 9182  
✅ **Prometheus** installed and running on port 9090  
✅ **Node.js 18+** installed  
✅ **Gemini API Key** from Google AI Studio  

## Step-by-Step Setup

### 1. Install Windows Exporter

Download from: https://github.com/prometheus-community/windows_exporter/releases

```powershell
# Run the installer or
.\windows_exporter.exe --collectors.enabled cpu,memory,net,logical_disk
```

Verify it's running:
```powershell
curl http://localhost:9182/metrics
```

### 2. Install Prometheus

Download from: https://prometheus.io/download/

Extract and create `prometheus.yml`:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'windows'
    static_configs:
      - targets: ['localhost:9182']
```

Start Prometheus:
```powershell
.\prometheus.exe --config.file=prometheus.yml
```

Verify:
- Open http://localhost:9090
- Go to Status → Targets
- Ensure 'windows' job is **UP**

### 3. Get Gemini API Key

1. Visit https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click **"Create API Key"**
4. Copy the key (starts with `AIza...`)

### 4. Setup Backend

```powershell
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and paste your Gemini API key:
# GEMINI_API_KEY=AIzaSy...

# Start backend
npm run dev
```

You should see:
```
🚀 Server started successfully
  port: 4000
  env: development
  prometheusUrl: http://localhost:9090
```

Test it:
```powershell
curl http://localhost:4000/api/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "ok": true,
    "services": {
      "prometheusUp": true,
      "aiConfigured": true
    }
  }
}
```

### 5. Setup Frontend

Open a **new terminal** (keep backend running):

```powershell
cd frontend

# Install dependencies
npm install

# Configure (optional - defaults work for local setup)
cp .env.example .env

# Start frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

### 6. Access the Application

Open your browser to: **http://localhost:5173**

You should see:
- ✅ Health status showing "All Systems Operational" (green)
- ✅ Query input field
- ✅ Demo query buttons

### 7. Try Your First Query

1. Enter: **"Show CPU usage for the last 15 minutes"**
2. Click **"Convert & Visualize"**
3. Wait 2-5 seconds

You should see:
- ✅ PromQL query: `rate(windows_cpu_time_total[15m]) * 100`
- ✅ KPI metrics (Current, Average, Max, Min)
- ✅ Interactive line chart with CPU data

🎉 **Success!** You're now running the full application.

## Quick Commands Reference

```powershell
# Backend
cd backend
npm run dev        # Start development server
npm run lint       # Check code quality
npm run format     # Format code

# Frontend
cd frontend
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build

# Docker (from project root)
docker-compose up -d              # Start all services
docker-compose logs -f            # View logs
docker-compose down               # Stop services
```

## Troubleshooting

### Backend won't start

**Error**: "GEMINI_API_KEY is required"

**Fix**:
```powershell
cd backend
cat .env
# Ensure GEMINI_API_KEY=your_actual_key_here
```

### Frontend shows "Cannot connect to backend"

**Fix**:
1. Ensure backend is running (check terminal)
2. Test: `curl http://localhost:4000/api/health`
3. If not running, restart: `cd backend && npm run dev`

### No data in chart

**Fix**:
1. Check Prometheus targets: http://localhost:9090/targets
2. Ensure 'windows' job is **UP**
3. Wait 30 seconds for first scrape
4. Try shorter lookback time (5 minutes)

### Port already in use

**Error**: "EADDRINUSE: address already in use :::4000"

**Fix**:
```powershell
# Find and kill process
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

## Next Steps

- ✅ Try all 4 demo queries
- ✅ Copy PromQL queries and test in Prometheus UI
- ✅ Read the full [README.md](README.md) for advanced features
- ✅ Set up [Grafana integration](docs/grafana-setup.md) (optional)
- ✅ Try [Docker deployment](docs/docker-setup.md)

## Need Help?

- 📚 Full documentation: [README.md](README.md)
- 🧪 Testing guide: [tests/ACCEPTANCE.md](tests/ACCEPTANCE.md)
- 🎬 Demo walkthrough: [docs/demo-script.md](docs/demo-script.md)
- 🔧 Docker setup: [docs/docker-setup.md](docs/docker-setup.md)
- 📊 Grafana setup: [docs/grafana-setup.md](docs/grafana-setup.md)

---

**Time to completion**: ~5 minutes  
**Difficulty**: Beginner-friendly  
**Support**: Create an issue on GitHub if you get stuck

🚀 **Happy monitoring!**

