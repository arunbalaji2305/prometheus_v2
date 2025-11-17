import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { geminiService } from '../services/gemini.service.js';
import { prometheusService } from '../services/prometheus.service.js';

const router = express.Router();

/**
 * GET /api/health
 * Health check endpoint for monitoring
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const [prometheusUp] = await Promise.all([
      prometheusService.healthCheck(),
    ]);

    const aiConfigured = geminiService.isHealthy();

    const allHealthy = prometheusUp && aiConfigured;

    res.status(allHealthy ? 200 : 503).json({
      success: true,
      data: {
        ok: allHealthy,
        timestamp: new Date().toISOString(),
        services: {
          prometheusUp,
          aiConfigured,
        },
      },
    });
  })
);

export default router;

