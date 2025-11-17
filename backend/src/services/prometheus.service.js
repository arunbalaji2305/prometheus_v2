import fetch from 'node-fetch';
import { config } from '../config/env.js';
import { logger } from '../config/logger.js';

class PrometheusService {
  constructor() {
    this.baseUrl = config.prometheusUrl;
    this.timeout = 10000; // 10 seconds
    this.metricCache = { values: null, fetchedAt: 0 };
  }

  /**
   * List all metric names known to Prometheus (cached for 60s)
   * @returns {Promise<string[]>}
   */
  async listMetricNames() {
    const now = Date.now();
    if (this.metricCache.values && now - this.metricCache.fetchedAt < 60_000) {
      return this.metricCache.values;
    }

    try {
      const url = new URL('/api/v1/label/__name__/values', this.baseUrl);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url.toString(), { method: 'GET', signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Prometheus returned ${response.status}`);
      }

      const data = await response.json();
      const values = Array.isArray(data?.data) ? data.data : [];
      this.metricCache = { values, fetchedAt: now };
      return values;
    } catch (error) {
      logger.warn({ error: error.message }, 'Failed to fetch Prometheus metric names');
      return []; // Fail open – don’t block queries if listing fails
    }
  }

  /**
   * Extract potential metric names from a PromQL query
   * @param {string} query
   * @returns {string[]} unique metric name candidates
   */
  extractMetricNames(query) {
    if (!query) return [];
    const KNOWN_FUNCTIONS = new Set([
      // aggregations
      'sum','avg','min','max','count','stddev','stdvar','topk','bottomk','quantile',
      // vector funcs
      'rate','irate','increase','delta','idelta','resets',
      'avg_over_time','min_over_time','max_over_time','sum_over_time','count_over_time',
      'quantile_over_time','stddev_over_time','stdvar_over_time',
      // scalars / transforms
      'histogram_quantile','abs','ceil','floor','clamp_max','clamp_min','ln','log2','log10',
      // label fns
      'label_replace','label_join'
    ]);
    const RESERVED = new Set(['by','without','on','ignoring','group_left','group_right','bool','and','or','unless']);

    const tokens = query.match(/[a-zA-Z_:][a-zA-Z0-9_:]*/g) || [];
    const metrics = new Set();
    for (const t of tokens) {
      const tl = t.toLowerCase();
      if (KNOWN_FUNCTIONS.has(tl) || RESERVED.has(tl)) continue;
      // Heuristic: metric names usually contain '_' and often start with a namespace prefix like windows_
      if (/[a-z_]/i.test(t) && !/^[a-z]+$/i.test(t)) {
        metrics.add(t);
      }
    }
    return Array.from(metrics);
  }

  /**
   * Validate that metric names used in a query exist in Prometheus
   * @param {string} query
   * @returns {Promise<{unknown: string[], known: string[]}>}
   */
  async validateMetricsInQuery(query) {
    const allMetrics = await this.listMetricNames();
    if (!allMetrics.length) {
      // If we cannot list metrics, don't block – treat as all known
      return { unknown: [], known: this.extractMetricNames(query) };
    }
    const metricSet = new Set(allMetrics);
    const used = this.extractMetricNames(query);
    const unknown = used.filter((m) => !metricSet.has(m));
    const known = used.filter((m) => metricSet.has(m));
    return { unknown, known };
  }

  /**
   * Execute a PromQL query against Prometheus query_range endpoint
   * @param {string} query - PromQL query
   * @param {number} start - Start timestamp (Unix time)
   * @param {number} end - End timestamp (Unix time)
   * @param {string} step - Query resolution step (e.g., '15s', '1m')
   * @returns {Promise<Object>} - Prometheus query result
   */
  async queryRange(query, start, end, step = '15s') {
    try {
      const url = new URL('/api/v1/query_range', this.baseUrl);
      url.searchParams.append('query', query);
      url.searchParams.append('start', start);
      url.searchParams.append('end', end);
      url.searchParams.append('step', step);

      logger.info(
        { query, start, end, step },
        'Executing Prometheus query_range'
      );

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url.toString(), {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = errorText;
        
        // Try to parse JSON error response from Prometheus
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // If not JSON, use the raw error text
        }
        
        logger.error(
          { status: response.status, error: errorMessage, query },
          'Prometheus query failed'
        );
        
        // Provide more helpful error messages
        if (errorMessage.includes('parse error')) {
          throw new Error(`Invalid PromQL syntax: ${errorMessage}`);
        } else if (errorMessage.includes('binary expression')) {
          throw new Error(`PromQL type error: ${errorMessage}. Check that operations are between compatible types.`);
        } else if (errorMessage.includes('unexpected')) {
          throw new Error(`PromQL syntax error: ${errorMessage}. Check query structure and operators.`);
        }
        
        throw new Error(`Prometheus returned ${response.status}: ${errorMessage}`);
      }

      const data = await response.json();

      if (data.status !== 'success') {
        const errorMsg = data.error || 'Prometheus query failed';
        logger.error({ data, query }, 'Prometheus returned non-success status');
        
        // Provide more context for common errors
        if (errorMsg.includes('parse error')) {
          throw new Error(`Invalid PromQL syntax: ${errorMsg}`);
        }
        
        throw new Error(errorMsg);
      }

      logger.info(
        { resultType: data.data?.resultType, resultCount: data.data?.result?.length },
        'Prometheus query successful'
      );

      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        logger.error('Prometheus query timeout');
        throw new Error('Prometheus query timed out after 10 seconds');
      }

      logger.error({ error: error.message }, 'Prometheus query error');
      throw new Error(`Failed to query Prometheus: ${error.message}`);
    }
  }

  /**
   * Execute a PromQL instant query
   * @param {string} query - PromQL query
   * @returns {Promise<Object>} - Prometheus query result
   */
  async query(query) {
    try {
      const url = new URL('/api/v1/query', this.baseUrl);
      url.searchParams.append('query', query);

      logger.info({ query }, 'Executing Prometheus instant query');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url.toString(), {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Prometheus returned ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== 'success') {
        throw new Error(data.error || 'Query failed');
      }

      return data;
    } catch (error) {
      logger.error({ error: error.message }, 'Prometheus instant query error');
      throw error;
    }
  }

  /**
   * Check if Prometheus is accessible
   * @returns {Promise<boolean>}
   */
  async healthCheck() {
    try {
      const url = new URL('/-/healthy', this.baseUrl);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(url.toString(), {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      logger.warn({ error: error.message }, 'Prometheus health check failed');
      return false;
    }
  }
}

export const prometheusService = new PrometheusService();

