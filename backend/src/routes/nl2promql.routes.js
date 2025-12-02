import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateBody, schemas, sanitizeInput } from '../middleware/validation.js';
import { geminiService } from '../services/gemini.service.js';
import { logger } from '../config/logger.js';
import { prometheusService } from '../services/prometheus.service.js';

const router = express.Router();

function isLowIntent(input) {
  const q = (input || '').toLowerCase();
  const words = q.split(/[^a-z0-9_]+/i).filter(Boolean);
  if (words.length <= 1) return true;
  const keywords = new Set([
    'cpu','processor','core','memory','ram','disk','io','i/o','network','nic','traffic','latency','errors','requests','throughput','bytes','read','write','usage','utilization','availability','uptime'
  ]);
  return !words.some((w) => keywords.has(w));
}

/**
 * POST /api/nl2promql
 * Convert natural language to PromQL using Gemini AI
 * 
 * Request body:
 * {
 *   "query": "CPU usage for the last 15 minutes",
 *   "lookback_minutes": 15  // Optional: time range for the chart
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "naturalLanguageQuery": "CPU usage for the last 15 minutes",
 *     "promqlQuery": "rate(windows_cpu_time_total[15m]) * 100"
 *   }
 * }
 */
router.post(
  '/',
  validateBody(schemas.nl2promql),
  asyncHandler(async (req, res) => {
    const { query, lookback_minutes } = req.body;

    // Sanitize input
    const sanitizedQuery = sanitizeInput(query);

    logger.info({ originalQuery: query, sanitizedQuery, lookback_minutes }, 'NL2PromQL request');

    // Guardrail: reject very low-intent/gibberish inputs
    if (isLowIntent(sanitizedQuery)) {
      return res.status(422).json({
        success: false,
        error: {
          message: 'Your request is too vague. Please mention a metric and optional time/window (e.g., "CPU usage 15m", "network traffic by interface", "memory available").',
          code: 'LOW_INTENT',
          statusCode: 422,
        },
      });
    }

    // Convert to PromQL using Gemini
    const promqlQuery = await geminiService.convertToPromQL(sanitizedQuery);

    // If lookback_minutes is provided, adjust the range selector in the PromQL
    let adjustedPromQL = promqlQuery;
    if (lookback_minutes && lookback_minutes > 0) {
      // Replace range selectors like [5m], [15m], [1h] with the lookback time
      const rangePattern = /\[(\d+)([mhd])\]/g;
      adjustedPromQL = promqlQuery.replace(rangePattern, `[${lookback_minutes}m]`);
      
      logger.info({ 
        original: promqlQuery, 
        adjusted: adjustedPromQL, 
        lookback_minutes 
      }, 'Adjusted PromQL range selector to match lookback');
    }

    // Validate metric names against Prometheus to avoid nonsense-but-valid outputs
    const { unknown, known } = await prometheusService.validateMetricsInQuery(adjustedPromQL);
    if (unknown.length > 0) {
      return res.status(422).json({
        success: false,
        error: {
          message: `Generated query references unknown metric(s): ${unknown.join(', ')}`,
          code: 'UNKNOWN_METRICS',
          statusCode: 422,
          details: {
            known,
            suggestion: 'Try rephrasing with CPU, memory, disk, or network terms. Example: "CPU usage last 15 minutes".',
          },
        },
      });
    }

    res.json({
      success: true,
      data: {
        naturalLanguageQuery: sanitizedQuery,
        promqlQuery: adjustedPromQL,
      },
    });
  })
);

export default router;

