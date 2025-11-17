# Natural Language to PromQL Frontend

React-based frontend application for converting natural language queries to PromQL and visualizing Prometheus metrics.

## Features

- **Natural Language Input**: Simple text input for querying metrics
- **AI-Powered Conversion**: Uses Gemini AI to generate PromQL queries
- **Interactive Charts**: Recharts-based line charts for time-series visualization
- **KPI Metrics**: Displays current, average, maximum, and minimum values
- **Demo Queries**: Quick-start queries for common monitoring scenarios
- **Grafana Integration**: Optional "Open in Grafana" button (when configured)
- **Dark Theme**: Modern, responsive dark UI with Tailwind CSS
- **Health Monitoring**: Real-time health status of backend services

## Prerequisites

- Node.js 18+
- Backend API running on port 4000
- Modern web browser

## Installation

```bash
cd frontend
npm install
```

## Configuration

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Edit `.env` with your settings:

```env
# Required: Backend API URL
VITE_API_BASE_URL=http://localhost:4000

# Optional: Grafana URL (enables "Open in Grafana" feature)
VITE_GRAFANA_BASE_URL=http://localhost:3000
```

## Running the Application

### Development Mode (with hot reload)

```bash
npm run dev
```

The app will open at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header.jsx              # App header with branding
│   │   ├── HealthStatus.jsx        # Service health indicators
│   │   ├── QueryInput.jsx          # NL query input form
│   │   ├── PromQLDisplay.jsx       # Generated PromQL display
│   │   ├── MetricsChart.jsx        # Recharts visualization
│   │   ├── KPIMetrics.jsx          # Key metrics cards
│   │   └── ErrorAlert.jsx          # Error display component
│   ├── services/
│   │   └── api.js                  # API client for backend
│   ├── utils/
│   │   ├── chartUtils.js           # Data transformation utilities
│   │   └── grafanaUtils.js         # Grafana integration helpers
│   ├── config.js                   # App configuration
│   ├── App.jsx                     # Main application component
│   ├── main.jsx                    # React entry point
│   └── index.css                   # Tailwind CSS + custom styles
├── public/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── package.json
└── README.md
```

## Usage

### Basic Workflow

1. **Enter a Query**: Type a natural language query like "CPU usage for the last 15 minutes"
2. **Set Parameters**: Adjust lookback time and step resolution if needed
3. **Click "Convert & Visualize"**: The app will:
   - Convert your query to PromQL using Gemini AI
   - Query Prometheus for data
   - Display the PromQL query (with copy button)
   - Show KPI metrics (current, average, max, min)
   - Render an interactive chart

### Demo Queries

The app includes pre-configured demo queries:

- **CPU Usage (15 min)**: "Show CPU usage for the last 15 minutes"
- **Memory Usage (1 hour)**: "Memory usage for last hour"
- **Network Traffic**: "Network traffic by interface"
- **Disk I/O (30 min)**: "Disk I/O rate for last 30 minutes"

Click any demo button to auto-fill and submit the query.

### Grafana Integration

If `VITE_GRAFANA_BASE_URL` is set in your `.env` file:

1. An "Open in Grafana" button appears after query results
2. Click it to open Grafana Explore with the same PromQL query and time range
3. This allows deeper analysis using Grafana's advanced features

## Technologies Used

- **React 18**: UI framework
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Charting library for React
- **Lucide React**: Modern icon library
- **date-fns**: Date formatting utilities

## Customization

### Adding New Demo Queries

Edit `src/config.js`:

```javascript
export const DEMO_QUERIES = [
  {
    id: 5,
    label: 'Custom Query',
    query: 'Your natural language query',
    lookback: 30,
  },
  // ... more queries
];
```

### Changing Colors

Edit `tailwind.config.js` to customize the primary color palette.

### Modifying Chart Appearance

Edit `src/components/MetricsChart.jsx` to adjust chart properties like height, colors, or axis labels.

## Troubleshooting

### Cannot Connect to Backend

**Error**: "Cannot connect to backend. Please ensure the server is running on port 4000."

**Solution**:
- Ensure the backend is running (`cd backend && npm run dev`)
- Check `VITE_API_BASE_URL` in `.env` matches your backend URL
- Verify CORS is configured correctly in the backend

### No Data in Chart

**Possible Causes**:
1. Prometheus has no data for the time range
2. The generated PromQL query is invalid
3. Windows Exporter is not running or not scraped by Prometheus

**Solution**:
- Check Prometheus UI (`http://localhost:9090/targets`) to ensure Windows Exporter is UP
- Verify the PromQL query in Prometheus UI directly
- Try a shorter lookback time

### Grafana Button Not Showing

**Cause**: `VITE_GRAFANA_BASE_URL` is not set in `.env`

**Solution**:
- Add `VITE_GRAFANA_BASE_URL=http://localhost:3000` to `.env`
- Restart the dev server (`npm run dev`)

### Chart Shows "No Data Points"

**Cause**: Prometheus returned an empty result set

**Solution**:
- Ensure your query targets existing metrics
- Check if Windows Exporter is exporting the metrics you're querying
- Try one of the demo queries to verify the system works

## Development

### Code Quality

```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run format
```

### Environment Variables

All environment variables must be prefixed with `VITE_` to be accessible in the frontend:

- `VITE_API_BASE_URL`: Backend API URL (required)
- `VITE_GRAFANA_BASE_URL`: Grafana URL (optional)

## License

MIT

