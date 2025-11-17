import { config } from '../config';

/**
 * Check if Grafana integration is enabled
 */
export function isGrafanaEnabled() {
  return !!config.grafanaBaseUrl;
}

/**
 * Generate Grafana Explore URL with pre-filled PromQL query and time range
 * @param {string} promqlQuery - PromQL query
 * @param {number} lookbackMinutes - Time range in minutes
 */
export function generateGrafanaUrl(promqlQuery, lookbackMinutes = 15) {
  if (!isGrafanaEnabled()) {
    return null;
  }

  const now = Date.now();
  const from = now - lookbackMinutes * 60 * 1000;

  // Build Grafana Explore URL
  // Format: /explore?left={...}
  const exploreParams = {
    datasource: 'Prometheus',
    queries: [
      {
        refId: 'A',
        expr: promqlQuery,
      },
    ],
    range: {
      from: from.toString(),
      to: now.toString(),
    },
  };

  const encodedParams = encodeURIComponent(JSON.stringify(exploreParams));
  return `${config.grafanaBaseUrl}/explore?left=${encodedParams}`;
}

