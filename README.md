# Natural Language to PromQL Query Conversion and Data Visualization

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.3.1-61dafb.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)
![Docker Hub](https://img.shields.io/badge/docker%20hub-arunbalaji23-blue.svg)

An AI-powered monitoring tool that converts natural language queries into PromQL (Prometheus Query Language) and visualizes metrics with interactive charts. Built for DevOps engineers, students, and anyone who wants to query Prometheus without memorizing PromQL syntax.

## 🐳 Quick Start with Docker Hub

Pull and run the pre-built images:

```bash
# Pull images from Docker Hub
docker pull arunbalaji23/prometheus-nl2promql-backend:latest
docker pull arunbalaji23/prometheus-nl2promql-frontend:latest

# Or use docker-compose (recommended)
docker-compose --profile with-grafana up -d
```

**Docker Hub Images:**
- Backend: [`arunbalaji23/prometheus-nl2promql-backend`](https://hub.docker.com/r/arunbalaji23/prometheus-nl2promql-backend)
- Frontend: [`arunbalaji23/prometheus-nl2promql-frontend`](https://hub.docker.com/r/arunbalaji23/prometheus-nl2promql-frontend)

## 🌟 Features

- **🤖 AI-Powered Conversion**: Uses Google Gemini 1.5 Flash to convert plain English to PromQL
- **🎯 Broad Query Support**: Handles 50+ natural language variations beyond demo queries
- **✨ Smart Validation**: Catches syntax errors before sending to Prometheus with automatic retry
- **📊 Interactive Visualization**: Beautiful charts powered by Recharts
- **📈 KPI Metrics**: Displays current, average, maximum, and minimum values
- **🔗 Grafana Integration**: Optional "Open in Grafana" button for advanced analysis
- **🔒 Security-First**: Rate limiting, input validation, helmet, CORS protection
- **🐳 Docker Ready**: Full Docker Compose setup for easy deployment
- **📱 Responsive Design**: Works on desktop, tablet, and mobile
- **🎨 Dark Theme**: Modern, easy-on-the-eyes interface

### 🎯 Query Capabilities

The system understands natural language variations for:
- **Simple queries**: "CPU", "memory", "network speed", "disk activity"
- **Time-based**: "CPU for last 15 minutes", "network last hour"
- **Aggregations**: "CPU by core", "network by interface", "disk per volume"
- **Combined metrics**: "Total disk I/O", "memory used", "all network bandwidth"
- **Unit conversions**: "Memory in GB", "disk in megabytes"
- **Statistical**: "Maximum CPU", "average network", "peak usage"
- **Filtering**: "CPU above 80%", "high memory usage"

See [SUPPORTED_QUERIES.md](SUPPORTED_QUERIES.md) for complete examples.

## 📸 Screenshots

### Main Interface
```
┌─────────────────────────────────────────────────────────┐
│  Natural Language to PromQL                             │
│  Query Prometheus metrics using plain English           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ✓ All Systems Operational                              │
│  ✓ Prometheus  ✓ Gemini AI                             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Query Builder                                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Show CPU usage for the last 15 minutes           │ │
│  └───────────────────────────────────────────────────┘ │
│  [Convert & Visualize]                                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Generated PromQL Query                                 │
│  rate(windows_cpu_time_total[15m]) * 100               │
│  [Copy]  [Open in Grafana]                             │
└─────────────────────────────────────────────────────────┘

┌────────┬────────┬────────┬────────┐
│Current │Average │Maximum │Minimum │
│  45.2  │  42.8  │  68.3  │  28.1  │
└────────┴────────┴────────┴────────┘

┌─────────────────────────────────────────────────────────┐
│  Metrics Visualization                                  │
│  [Interactive Line Chart]                               │
└─────────────────────────────────────────────────────────┘
```

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                        User                               │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │   Frontend (React)    │
          │   Port: 5173 / 80     │
          │  • Tailwind CSS       │
          │  • Recharts           │
          │  • Vite               │
          └──────────┬────────────┘
                     │
                     │ HTTP REST API
                     ▼
          ┌──────────────────────┐
          │   Backend (Node.js)   │
          │   Port: 4000          │
          │  • Express            │
          │  • Pino Logger        │
          │  • Zod Validation     │
          └──┬────────────────┬───┘
             │                │
             │                │
    ┌────────▼──────┐   ┌────▼──────────┐
    │   Gemini AI   │   │  Prometheus   │
    │  (NL→PromQL)  │   │   Port: 9090  │
    └───────────────┘   └────┬──────────┘
                             │
                             │ scrapes
                             ▼
                   ┌─────────────────────┐
                   │  Windows Exporter   │
                   │    Port: 9182       │
                   │  (System Metrics)   │
                   └─────────────────────┘

                   ┌─────────────────────┐
                   │    Grafana (Opt)    │
                   │    Port: 3000       │
                   └─────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** ([Download](https://nodejs.org/))
- **Docker & Docker Compose** ([Download](https://www.docker.com/products/docker-desktop))
- **Windows Exporter** (see installation below)
- **Google Gemini API Key** ([Get Key](https://makersuite.google.com/app/apikey))

### 🪟 Windows Exporter Setup (Required)

Windows Exporter collects system metrics (CPU, memory, disk, network) that Prometheus scrapes. You need to install this on your host machine **before** running the Docker containers.

#### Installation Steps

1. **Download Windows Exporter**
   - Visit: https://github.com/prometheus-community/windows_exporter/releases
   - Download the latest `windows_exporter-*.msi` file (e.g., `windows_exporter-0.25.1-amd64.msi`)

2. **Install Windows Exporter**
   ```powershell
   # Run the MSI installer (double-click or use command line)
   # It will install as a Windows service and start automatically
   ```

3. **Verify Installation**
   ```powershell
   # Check if the service is running
   Get-Service windows_exporter
   
   # Should show: Status = Running
   ```

4. **Test Metrics Endpoint**
   - Open browser to: http://localhost:9182/metrics
   - You should see hundreds of metrics like:
     ```
     windows_cpu_time_total{core="0",mode="idle"} 12345.67
     windows_os_physical_memory_free_bytes 4294967296
     windows_logical_disk_free_bytes{volume="C:"} 25000000000
     ```

5. **That's it!** 
   - Windows Exporter is now running on port **9182**
   - Prometheus (via Docker) is **already configured** to scrape it using `host.docker.internal:9182`
   - No additional configuration needed

#### Docker Networking Note

The `prometheus.yml` configuration uses `host.docker.internal:9182` to access Windows Exporter running on your host machine from inside the Docker container. This special DNS name is provided by Docker Desktop and automatically resolves to your host's IP address.

### Option 1: Docker Setup (Recommended - Fastest Setup)

This is the **easiest way** for new users. Just install Windows Exporter (above) and run one command:

```bash
# 1. Clone repository
git clone <repository-url>
cd Prometheus_proj

# 2. Create .env file
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# 3. Start everything with one command
docker-compose --profile with-grafana up -d
```

**What this does:**
- Pulls pre-built images from Docker Hub (no build needed!)
- Starts Backend (Node.js on port 4000)
- Starts Frontend (React on port 80)
- Starts Prometheus (port 9090) - automatically scrapes `host.docker.internal:9182`
- Starts Grafana (port 3000) - optional, for advanced dashboards

**Access:**
- Frontend: http://localhost
- Backend API: http://localhost:4000
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (admin/admin)

**Verify Prometheus is scraping Windows Exporter:**
1. Open http://localhost:9090/targets
2. Look for `windows_exporter` job - should show **Status: UP**
3. If UP, you're all set! Try a query like "Show CPU usage"

See [docs/docker-setup.md](docs/docker-setup.md) for detailed Docker documentation.

### Option 2: Local Development Setup (For Development)

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd Prometheus_proj
```

#### 2. Install Windows Exporter

Follow the Windows Exporter setup instructions above. You must have it running on port 9182.

#### 3. Install and Configure Prometheus

```bash
# Download Prometheus from https://prometheus.io/download/
# Extract and navigate to prometheus directory

# Copy the provided prometheus.yml from this repo
copy prometheus\prometheus.yml <prometheus-install-dir>\prometheus.yml

# Start Prometheus
prometheus.exe --config.file=prometheus.yml
```

Prometheus will run on `http://localhost:9090`

#### 4. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start backend
npm run dev
```

Backend will run on `http://localhost:4000`

#### 5. Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env if needed (default values work for local setup)

# Start frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

#### 6. Access the Application

Open your browser to `http://localhost:5173`

**Note:** For local development, you'll need to run Prometheus and Windows Exporter separately on your host machine. The provided `prometheus.yml` works for both Docker and local setups.


## 📁 Project Structure

```
Prometheus_proj/
├── backend/                    # Node.js backend
│   ├── src/
│   │   ├── config/            # Configuration & prompts
│   │   ├── middleware/        # Express middleware
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business logic
│   │   └── index.js           # Entry point
│   ├── package.json
│   ├── Dockerfile
│   └── README.md
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── services/          # API client
│   │   ├── utils/             # Helper functions
│   │   ├── App.jsx            # Main app
│   │   └── main.jsx           # Entry point
│   ├── package.json
│   ├── Dockerfile
│   └── README.md
│
├── docs/                       # Documentation
│   ├── grafana-setup.md       # Grafana integration guide
│   ├── alerting-setup.md      # Alerting system guide
│   ├── docker-setup.md        # Docker deployment guide
│   └── demo-script.md         # Demo walkthrough
│
├── tests/                      # Test documentation
│   └── ACCEPTANCE.md          # Acceptance test suite
│
├── prometheus/                 # Prometheus configuration
│   └── prometheus.yml
│
├── grafana/                    # Grafana provisioning
│   └── provisioning/
│       ├── datasources/       # Prometheus datasource
│       └── alerting/          # Alert rules & notifications
│
├── docker-compose.yml          # Docker orchestration
├── Makefile                    # Convenience commands
└── README.md                   # This file
```

## 🔧 Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Optional (defaults shown)
PORT=4000
PROMETHEUS_URL=http://localhost:9090
NODE_ENV=development
```

### Frontend Environment Variables

Create `frontend/.env`:

```env
# Required
VITE_API_BASE_URL=http://localhost:4000

# Optional (enables Grafana integration)
VITE_GRAFANA_BASE_URL=http://localhost:3000
```

## 📖 Usage

### Basic Workflow

1. **Enter a Natural Language Query**
   - Type: "CPU usage for the last 15 minutes"
   - Set lookback time (default: 15 minutes)
   - Set step resolution (default: 15s)

2. **Click "Convert & Visualize"**
   - Backend sends query to Gemini AI
   - AI returns PromQL query
   - Backend queries Prometheus
   - Frontend displays results

3. **View Results**
   - **PromQL Query**: Copy or open in Grafana
   - **KPI Metrics**: Current, Average, Max, Min
   - **Interactive Chart**: Hover for details

### Demo Queries

The application includes 4 demo queries:

| Query | Description | Lookback |
|-------|-------------|----------|
| CPU Usage (15 min) | "Show CPU usage for the last 15 minutes" | 15 min |
| Memory Usage (1 hour) | "Memory usage for last hour" | 60 min |
| Network Traffic | "Network traffic by interface" | 30 min |
| Disk I/O (30 min) | "Disk I/O rate for last 30 minutes" | 30 min |

Click any demo button to auto-fill and submit the query.

### Example Queries You Can Try

```
"Show me CPU usage by core"
"Memory available in gigabytes"
"Network errors on all interfaces"
"Disk read operations per second"
"System uptime"
"Process count over the last hour"
```

## 🔗 Grafana Integration

### Setup

1. Install Grafana ([Instructions](docs/grafana-setup.md))
2. Add Prometheus data source (http://localhost:9090)
3. Set `VITE_GRAFANA_BASE_URL=http://localhost:3000` in frontend `.env`
4. Restart frontend

### Usage

After viewing query results:
1. Click **"Open in Grafana"** button
2. Grafana Explore opens in new tab
3. PromQL query and time range are pre-filled
4. Click **Run query** or customize further

See [docs/grafana-setup.md](docs/grafana-setup.md) for detailed setup instructions.

## 🐳 Docker Commands

Using the Makefile:

```bash
# View all commands
make help

# Install dependencies locally
make install

# Build Docker images
make build

# Start services (without Grafana)
make up

# Start services (with Grafana)
make up-grafana

# View logs
make logs

# Stop services
make down

# Clean up everything
make clean
```

Or use Docker Compose directly:

```bash
# Start services
docker-compose up -d

# With Grafana
docker-compose --profile with-grafana up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Remove volumes too
docker-compose down -v
```

## 🔒 Security Features

This application implements multiple security layers:

- **Helmet**: Sets secure HTTP headers
- **CORS**: Configurable origin restrictions
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Zod schemas validate all inputs
- **Input Sanitization**: Removes potentially dangerous characters
- **Secret Redaction**: API keys never appear in logs
- **Request Timeouts**: Prevents hanging requests
- **Health Checks**: Monitors service availability

For production deployment:
- Use HTTPS (reverse proxy with SSL)
- Change default passwords (Grafana)
- Restrict CORS to specific origins
- Monitor rate limit violations
- Set up proper logging infrastructure

## 🧪 Testing

### Manual Acceptance Tests

Run the comprehensive test suite:

```bash
# Follow instructions in
tests/ACCEPTANCE.md
```

Tests cover:
- Backend API endpoints
- Frontend UI interactions
- End-to-end workflows
- Error handling
- Security validation
- Browser compatibility

### Demo Script

Run a complete demo:

```bash
# Follow the demo script in
docs/demo-script.md
```

Includes:
- Prerequisites check
- Step-by-step walkthrough
- Live system stress test
- Common Q&A

## 📊 API Documentation

### Backend Endpoints

#### `GET /api/health`

**Description**: Health check for all services

**Response**:
```json
{
  "success": true,
  "data": {
    "ok": true,
    "timestamp": "2024-11-09T12:00:00.000Z",
    "services": {
      "prometheusUp": true,
      "aiConfigured": true
    }
  }
}
```

#### `POST /api/nl2promql`

**Description**: Convert natural language to PromQL

**Request**:
```json
{
  "query": "CPU usage for the last 15 minutes"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "naturalLanguageQuery": "CPU usage for the last 15 minutes",
    "promqlQuery": "rate(windows_cpu_time_total[15m]) * 100"
  }
}
```

#### `GET /api/prometheus/query_range`

**Description**: Query Prometheus for time-series data

**Parameters**:
- `query` (string): PromQL query
- `start` (number): Start timestamp (Unix time)
- `end` (number): End timestamp (Unix time)
- `step` (string): Resolution (e.g., "15s", "1m")

**Response**:
```json
{
  "success": true,
  "data": {
    "resultType": "matrix",
    "result": [
      {
        "metric": { "core": "0" },
        "values": [[1699564800, "0.123"], ...]
      }
    ]
  }
}
```

## 🐛 Troubleshooting

### PromQL Generation Issues

#### Issue: "parse error: binary expression" or "unexpected <by>"

**These are syntax errors in generated PromQL queries.**

**Solution**: The latest fixes address these issues. See:
- 📄 [PROMQL_GENERATION_FIX.md](PROMQL_GENERATION_FIX.md) - Detailed explanation of fixes
- 🧪 [TESTING_GUIDE.md](TESTING_GUIDE.md) - How to test and verify

**Quick Fix Steps:**
1. Ensure you have the latest code with enhanced validation
2. Restart backend: `docker-compose restart backend` (or `npm start`)
3. Test with: `node test-promql-generation.js`
4. Demo queries should now work without syntax errors

The system now:
- ✅ Validates PromQL syntax before sending to Prometheus
- ✅ Automatically retries with different AI models if validation fails
- ✅ Provides better error messages
- ✅ Catches common syntax errors early

---

### Common Issues

#### Issue: Backend won't start

**Error**: `GEMINI_API_KEY is required`

**Solution**:
```bash
# Ensure .env exists and has valid API key
cd backend
cat .env
# Should show: GEMINI_API_KEY=your_actual_key_here
```

---

#### Issue: Cannot connect to backend

**Error**: "Cannot connect to backend. Please ensure the server is running on port 4000."

**Solution**:
1. Check if backend is running:
   ```bash
   curl http://localhost:4000/api/health
   ```
2. If not running, start it:
   ```bash
   cd backend
   npm run dev
   ```
3. Check firewall isn't blocking port 4000

---

#### Issue: Prometheus connection failed

**Error**: `prometheusUp: false` in health check

**Solution**:
1. Verify Prometheus is running:
   ```bash
   curl http://localhost:9090/-/healthy
   ```
2. Check `PROMETHEUS_URL` in `backend/.env`:
   ```env
   PROMETHEUS_URL=http://localhost:9090
   ```
3. Ensure Prometheus is scraping Windows Exporter:
   - Open `http://localhost:9090/targets`
   - Verify `windows_exporter` job is **UP**

---

#### Issue: Windows Exporter not scraped

**Error**: No data in Prometheus for Windows metrics, or `windows_exporter` target shows DOWN

**Solution**:
1. **Check if Windows Exporter is running:**
   ```powershell
   # Check service status
   Get-Service windows_exporter
   
   # Test metrics endpoint
   curl http://localhost:9182/metrics
   ```

2. **If not installed**, follow installation steps:
   - Download from: https://github.com/prometheus-community/windows_exporter/releases
   - Run the `.msi` installer (installs as Windows service)
   - Verify at http://localhost:9182/metrics

3. **Docker Setup**: If using Docker Compose, Prometheus is already configured to use `host.docker.internal:9182`. Just ensure Windows Exporter is installed on your host.

4. **Local Development**: If running Prometheus locally (not in Docker), verify your `prometheus.yml`:
   ```yaml
   scrape_configs:
     - job_name: 'windows_exporter'
       static_configs:
         - targets: ['localhost:9182']
   ```

5. Restart Prometheus and check http://localhost:9090/targets

**Note**: The provided `prometheus.yml` uses `host.docker.internal:9182` which works for both Docker Desktop and local setups.

---

#### Issue: Gemini API rate limit exceeded

**Error**: "Gemini API quota exceeded. Please try again later."

**Solution**:
- **Free tier**: 15 requests per minute
- Wait 1 minute and try again
- Or upgrade to paid tier at https://console.cloud.google.com/

---

#### Issue: CORS errors in browser console

**Error**: `Access to fetch at 'http://localhost:4000' from origin 'http://localhost:5173' has been blocked by CORS`

**Solution**:
1. Ensure backend CORS is configured for your frontend origin
2. In `backend/src/index.js`, check:
   ```javascript
   app.use(cors({
     origin: ['http://localhost:5173', 'http://localhost:3000'],
     credentials: true,
   }));
   ```
3. Restart backend

---

#### Issue: No data in chart

**Error**: Chart shows "No data to display"

**Solutions**:
1. **Prometheus has no data**: Wait 30 seconds for first scrape
2. **Invalid PromQL**: Test query directly in Prometheus UI
3. **Time range too narrow**: Try longer lookback (e.g., 60 minutes)
4. **Wrong metric name**: Gemini may generate query for metrics you don't have

**Debugging**:
```bash
# Test query in Prometheus
curl "http://localhost:9090/api/v1/query?query=up"
```

---

#### Issue: Grafana button not showing

**Solution**:
1. Ensure `VITE_GRAFANA_BASE_URL` is set in `frontend/.env`
2. Restart frontend dev server:
   ```bash
   cd frontend
   npm run dev
   ```
3. Hard refresh browser (Ctrl+Shift+R)

---

#### Issue: Grafana alerting conflict error

**Error**: `failed to read unified alerting enabled setting: legacy and unified alerting cannot both be enabled`

**Solution**:
This happens when Grafana has cached legacy alerting settings in its volume. Run the fix script:

**Windows:**
```bash
# Use the automated fix script
./fix-grafana.bat
```

**Manual Steps:**
```bash
# Stop all containers
docker-compose --profile with-grafana down

# Remove Grafana volume (resets Grafana data)
docker volume rm prometheus_proj_grafana-data

# Pull latest images
docker-compose --profile with-grafana pull

# Start fresh
docker-compose --profile with-grafana up -d
```

**Note**: This will reset Grafana to default settings (admin/admin). The latest docker-compose.yml explicitly sets `GF_ALERTING_ENABLED=false` to prevent this conflict.

---

#### Issue: Port already in use

**Error**: `EADDRINUSE: address already in use :::4000`

**Solution**:
```powershell
# Find process using port
netstat -ano | findstr :4000

# Kill process by PID
taskkill /PID <PID> /F

# Or use different port in .env
PORT=4001
```

---

#### Issue: Docker containers keep restarting

**Solution**:
```bash
# Check logs
docker-compose logs backend

# Common causes:
# 1. Missing GEMINI_API_KEY in .env
# 2. Port conflicts
# 3. Insufficient memory

# Fix and rebuild
docker-compose down
docker-compose up -d --build
```

---

### Getting Help

If you encounter issues not covered here:

1. **Check logs**:
   - Backend: Terminal where `npm run dev` is running
   - Browser: F12 → Console tab
   - Docker: `docker-compose logs -f`

2. **Verify environment**:
   - Node version: `node --version` (should be 18+)
   - npm version: `npm --version`
   - All `.env` files configured correctly

3. **Test each component separately**:
   - Windows Exporter: `http://localhost:9182/metrics`
   - Prometheus: `http://localhost:9090`
   - Backend: `http://localhost:4000/api/health`
   - Frontend: `http://localhost:5173`

4. **Create an issue** on GitHub with:
   - Error message
   - Steps to reproduce
   - Environment details (OS, Node version)
   - Relevant logs

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- **Backend**: Follow ESLint rules, use Prettier for formatting
- **Frontend**: Use React best practices, maintain component modularity
- **Commits**: Write clear, descriptive commit messages
- **Documentation**: Update README and docs for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

Built with:

- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Express](https://expressjs.com/) - Backend framework
- [Prometheus](https://prometheus.io/) - Monitoring system
- [Google Gemini](https://ai.google.dev/) - AI model
- [Recharts](https://recharts.org/) - Charting library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Grafana](https://grafana.com/) - Visualization platform

Special thanks to:
- [Windows Exporter](https://github.com/prometheus-community/windows_exporter) community
- Open source contributors

## 📧 Contact

For questions or feedback:
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- Email: your.email@example.com

## 🗺️ Roadmap

Future enhancements:

- [ ] Support for Linux/Mac metrics (node_exporter)
- [ ] Custom dashboard builder
- [ ] Query history and favorites
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Advanced PromQL editor with autocomplete
- [x] ~~Integration with Alertmanager~~ **Grafana Alerting Implemented!**
- [ ] Export charts as images/PDFs
- [ ] User authentication and multi-tenancy
- [ ] Real-time metric streaming (WebSocket)

## 📚 Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [PromQL Cheat Sheet](https://promlabs.com/promql-cheat-sheet/)
- [Grafana Tutorials](https://grafana.com/tutorials/)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Windows Exporter Metrics](https://github.com/prometheus-community/windows_exporter#metrics)

---

**⭐ If you find this project useful, please give it a star on GitHub!**

**Made with ❤️ for the DevOps community**

