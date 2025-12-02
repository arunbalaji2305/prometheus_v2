import { format } from 'date-fns';

/**
 * Transform Prometheus range query result into Recharts format
 * @param {Object} prometheusData - Prometheus API response data
 * @returns {Array} Recharts-compatible data array
 */
export function transformPrometheusData(prometheusData) {
  if (!prometheusData || !prometheusData.result || prometheusData.result.length === 0) {
    return [];
  }

  // Get all unique timestamps across all series
  const timestampSet = new Set();
  prometheusData.result.forEach((series) => {
    series.values.forEach(([timestamp]) => {
      timestampSet.add(timestamp);
    });
  });

  const timestamps = Array.from(timestampSet).sort((a, b) => a - b);

  // Build data points
  const chartData = timestamps.map((timestamp) => {
    const dataPoint = {
      timestamp: timestamp * 1000, // Convert to milliseconds
      time: format(new Date(timestamp * 1000), 'HH:mm:ss'),
    };

    // Add each series as a separate line
    prometheusData.result.forEach((series, idx) => {
      const seriesName = getSeriesName(series.metric, idx);
      const value = findValueAtTimestamp(series.values, timestamp);
      dataPoint[seriesName] = value !== null ? parseFloat(value) : null;
    });

    return dataPoint;
  });

  return chartData;
}

/**
 * Find value at specific timestamp in series values
 */
function findValueAtTimestamp(values, targetTimestamp) {
  const match = values.find(([timestamp]) => timestamp === targetTimestamp);
  return match ? match[1] : null;
}

/**
 * Generate a friendly name for a series based on its labels
 */
export function getSeriesName(metric, index) {
  // Try to use meaningful labels
  if (metric.core !== undefined) {
    return `Core ${metric.core}`;
  }
  if (metric.nic) {
    return metric.nic;
  }
  if (metric.volume) {
    return metric.volume;
  }
  if (metric.instance) {
    return metric.instance;
  }
  if (metric.job) {
    return metric.job;
  }
  
  // Fallback to generic name
  return `Series ${index + 1}`;
}

/**
 * Get series names from Prometheus data
 */
export function getSeriesNames(prometheusData) {
  if (!prometheusData || !prometheusData.result) {
    return [];
  }

  return prometheusData.result.map((series, idx) => getSeriesName(series.metric, idx));
}

/**
 * Calculate KPI metrics from Prometheus data
 */
export function calculateKPIs(prometheusData) {
  if (!prometheusData || !prometheusData.result || prometheusData.result.length === 0) {
    return null;
  }

  let allValues = [];
  prometheusData.result.forEach((series) => {
    const values = series.values.map(([, value]) => parseFloat(value));
    allValues = allValues.concat(values);
  });

  if (allValues.length === 0) {
    return null;
  }

  const validValues = allValues.filter((v) => !isNaN(v) && v !== null);

  if (validValues.length === 0) {
    return null;
  }

  const sum = validValues.reduce((acc, val) => acc + val, 0);
  const avg = sum / validValues.length;
  const max = Math.max(...validValues);
  const min = Math.min(...validValues);
  const latest = validValues[validValues.length - 1];

  return {
    current: latest,
    average: avg,
    maximum: max,
    minimum: min,
  };
}

/**
 * Format large numbers with appropriate units
 * @param {number} value - The number to format
 * @param {number} decimals - Number of decimal places
 * @param {string} unit - Optional unit (bytes, percent, rate, etc.)
 */
export function formatNumber(value, decimals = 2, unit = null) {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }

  const absValue = Math.abs(value);

  // Handle bytes specifically
  if (unit === 'bytes' || unit === 'bytes/s') {
    if (absValue >= 1073741824) { // 1 GB
      return `${(value / 1073741824).toFixed(decimals)} GB${unit === 'bytes/s' ? '/s' : ''}`;
    }
    if (absValue >= 1048576) { // 1 MB
      return `${(value / 1048576).toFixed(decimals)} MB${unit === 'bytes/s' ? '/s' : ''}`;
    }
    if (absValue >= 1024) { // 1 KB
      return `${(value / 1024).toFixed(decimals)} KB${unit === 'bytes/s' ? '/s' : ''}`;
    }
    return `${value.toFixed(decimals)} B${unit === 'bytes/s' ? '/s' : ''}`;
  }

  // Handle percentages
  if (unit === 'percent' || unit === '%') {
    return `${value.toFixed(decimals)}%`;
  }

  // Handle generic large numbers
  if (absValue >= 1e9) {
    return `${(value / 1e9).toFixed(decimals)}B`;
  }
  if (absValue >= 1e6) {
    return `${(value / 1e6).toFixed(decimals)}M`;
  }
  if (absValue >= 1e3) {
    return `${(value / 1e3).toFixed(decimals)}K`;
  }

  return value.toFixed(decimals);
}

/**
 * Detect unit from PromQL query
 */
export function detectUnit(promqlQuery) {
  const query = promqlQuery.toLowerCase();

  // Check for percentage queries
  if (query.includes('* 100') || query.includes('percent')) {
    return 'percent';
  }

  // Check for rate queries (which return per-second values)
  if (query.includes('rate(') || query.includes('irate(')) {
    // If it's a bytes metric with rate, it's bytes per second
    if (query.includes('bytes')) {
      return 'bytes/s';
    }
    return '/s';
  }

  // Check for byte metrics
  if (query.includes('bytes') || query.includes('memory')) {
    return 'bytes';
  }

  return null;
}

/**
 * Generate random color for chart lines
 */
export function getChartColor(index) {
  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // yellow
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
  ];

  return colors[index % colors.length];
}

