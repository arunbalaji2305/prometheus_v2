// Configuration from environment variables
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  grafanaBaseUrl: import.meta.env.VITE_GRAFANA_BASE_URL || '',
};

// API endpoints
export const API_ENDPOINTS = {
  health: `${config.apiBaseUrl}/api/health`,
  nl2promql: `${config.apiBaseUrl}/api/nl2promql`,
  queryRange: `${config.apiBaseUrl}/api/prometheus/query_range`,
};

// Demo queries for quick access
export const DEMO_QUERIES = [
  {
    id: 1,
    label: 'CPU Usage (15 min)',
    query: 'Show CPU usage for the last 15 minutes',
    lookback: 15,
  },
  {
    id: 2,
    label: 'Memory Available',
    query: 'Available memory',
    lookback: 60,
  },
  {
    id: 3,
    label: 'Network Traffic',
    query: 'Network traffic by interface',
    lookback: 30,
  },
  {
    id: 4,
    label: 'Disk I/O (30 min)',
    query: 'Disk I/O rate for last 30 minutes',
    lookback: 30,
  },
];

