import { API_ENDPOINTS } from '../config';

/**
 * API client for backend communication
 */
class ApiClient {
  /**
   * Make a fetch request with error handling
   */
  async request(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend. Please ensure the server is running on port 4000.');
      }
      throw error;
    }
  }

  /**
   * Check backend health
   */
  async checkHealth() {
    return this.request(API_ENDPOINTS.health);
  }

  /**
   * Convert natural language to PromQL
   * @param {string} query - Natural language query
   * @param {number} lookbackMinutes - Lookback time in minutes (optional)
   */
  async convertToPromQL(query, lookbackMinutes) {
    return this.request(API_ENDPOINTS.nl2promql, {
      method: 'POST',
      body: JSON.stringify({ 
        query,
        lookback_minutes: lookbackMinutes 
      }),
    });
  }

  /**
   * Query Prometheus with range query
   * @param {string} promqlQuery - PromQL query
   * @param {number} lookbackMinutes - How many minutes to look back
   * @param {string} step - Query resolution
   */
  async queryPrometheus(promqlQuery, lookbackMinutes = 15, step = '15s') {
    const endTime = Math.floor(Date.now() / 1000);
    const startTime = endTime - lookbackMinutes * 60;

    const params = new URLSearchParams({
      query: promqlQuery,
      start: startTime.toString(),
      end: endTime.toString(),
      step,
    });

    return this.request(`${API_ENDPOINTS.queryRange}?${params.toString()}`);
  }
}

export const apiClient = new ApiClient();

