import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateQuery, schemas } from '../middleware/validation.js';
import { prometheusService } from '../services/prometheus.service.js';
import { logger } from '../config/logger.js';

const router = express.Router();

/**
 * GET /api/prometheus/query_range
 * Proxy to Prometheus query_range endpoint
 * 
 * Query parameters:
 * - query: PromQL query string (required)
 * - start: Start timestamp in Unix time (required)
 * - end: End timestamp in Unix time (required)
 * - step: Query resolution step, e.g., '15s', '1m' (optional, default: '15s')
 * 
 * Example:
 * GET /api/prometheus/query_range?query=rate(windows_cpu_time_total[5m])&start=1699564800&end=1699565400&step=15s
 */
router.get(
  '/query_range',
  validateQuery(schemas.queryRange),
  asyncHandler(async (req, res) => {
    const { query, start, end, step } = req.query;

    logger.info(
      { query, start, end, step },
      'Prometheus query_range request'
    );

    // Convert start and end to numbers if they're strings
    const startTime = Number(start);
    const endTime = Number(end);

    // Query Prometheus
    const result = await prometheusService.queryRange(
      query,
      startTime,
      endTime,
      step || '15s'
    );

    res.json({
      success: true,
      data: result.data,
    });
  })
);

/**
 * GET /api/prometheus/query
 * Proxy to Prometheus instant query endpoint
 */
router.get(
  '/query',
  asyncHandler(async (req, res) => {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Query parameter is required',
          code: 'VALIDATION_ERROR',
          statusCode: 400,
        },
      });
    }

    logger.info({ query }, 'Prometheus instant query request');

    const result = await prometheusService.query(query);

    res.json({
      success: true,
      data: result.data,
    });
  })
);

export default router;

