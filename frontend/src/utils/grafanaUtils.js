import { config } from '../config';

/**
 * Check if Grafana integration is enabled
 */
export function isGrafanaEnabled() {
  return !!config.grafanaBaseUrl;
}

/**
 * Detect query intent from natural language and PromQL
 * @param {string} naturalQuery - User's natural language query
 * @param {string} promqlQuery - Generated PromQL query
 * @returns {Array} Array of detected intent categories
 */
function detectQueryIntent(naturalQuery, promqlQuery) {
  const query = `${naturalQuery} ${promqlQuery}`.toLowerCase();
  const intents = [];

  if (/cpu|processor|core/i.test(query)) intents.push('cpu');
  if (/memory|ram|mem/i.test(query)) intents.push('memory');
  if (/disk|storage|volume/i.test(query)) intents.push('disk');
  if (/network|net|traffic|bandwidth/i.test(query)) intents.push('network');
  if (/system|uptime|process/i.test(query)) intents.push('system');

  return intents.length > 0 ? intents : ['system'];
}



/**
 * Generate Grafana Explore URL with pre-filled PromQL query
 * @param {string} promqlQuery - PromQL query
 * @param {number} lookbackMinutes - Time range in minutes
 */
export function generateGrafanaExploreUrl(promqlQuery, lookbackMinutes = 15) {
  if (!isGrafanaEnabled()) {
    return null;
  }

  const now = Date.now();
  const from = now - lookbackMinutes * 60 * 1000;

  const exploreParams = {
    datasource: 'Prometheus',
    queries: [
      {
        refId: 'A',
        expr: promqlQuery,
        range: true,
        instant: false,
        exemplar: true,
      },
    ],
    range: {
      from: from.toString(),
      to: now.toString(),
    },
  };

  const encodedParams = encodeURIComponent(JSON.stringify(exploreParams));
  return `${config.grafanaBaseUrl}/explore?orgId=1&left=${encodedParams}`;
}

/**
 * Generate Grafana Dashboard URL
 * Opens the comprehensive Windows Exporter Dashboard
 * @param {string} naturalQuery - User's natural language query
 * @param {string} promqlQuery - Generated PromQL query
 * @param {number} lookbackMinutes - Time range in minutes
 */
export function generateGrafanaDashboardUrl(naturalQuery, promqlQuery, lookbackMinutes = 15) {
  if (!isGrafanaEnabled()) {
    return null;
  }

  const now = Date.now();
  const from = now - lookbackMinutes * 60 * 1000;

  // Use the existing Windows Exporter Dashboard
  const dashboardUid = 'Kdh0OoSGz';
  
  const params = new URLSearchParams({
    orgId: '1',
    from: from.toString(),
    to: now.toString(),
    refresh: '30s',
    'var-job': 'windows Exporter',
    'var-hostname': '$__all',
    'var-instance': 'localhost:9182',
    'var-show_hostname': 'ABREAL'
  });

  return `${config.grafanaBaseUrl}/d/${dashboardUid}/windows-exporter-dashboard-2025-v0-312b-compatible?${params.toString()}`;
}

/**
 * Main function to generate Grafana URL (defaults to Explore)
 * @param {string} promqlQuery - PromQL query
 * @param {number} lookbackMinutes - Time range in minutes
 */
export function generateGrafanaUrl(promqlQuery, lookbackMinutes = 15) {
  return generateGrafanaExploreUrl(promqlQuery, lookbackMinutes);
}

