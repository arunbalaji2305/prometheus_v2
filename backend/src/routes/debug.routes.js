import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { geminiService } from '../services/gemini.service.js';
import { logger } from '../config/logger.js';

const router = express.Router();

/**
 * GET /api/debug/models
 * List available Gemini models for debugging
 */
router.get(
  '/models',
  asyncHandler(async (req, res) => {
    logger.info('Debug: Listing available models');
    
    try {
      const models = await geminiService.listAvailableModels();
      res.json({
        success: true,
        data: {
          models,
          configuredModels: models, // listAvailableModels returns modelNames
          isConfigured: geminiService.isHealthy(),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: error.message,
          code: 'DEBUG_ERROR',
          statusCode: 500,
        },
      });
    }
  })
);

export default router;

