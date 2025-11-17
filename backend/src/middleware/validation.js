import { z } from 'zod';
import { logger } from '../config/logger.js';

/**
 * Validation schemas
 */
export const schemas = {
  nl2promql: z.object({
    query: z
      .string()
      .min(3, 'Query must be at least 3 characters')
      .max(500, 'Query must not exceed 500 characters')
      .trim(),
  }),

  queryRange: z.object({
    query: z.string().min(1, 'PromQL query is required'),
    start: z
      .string()
      .or(z.number())
      .refine((val) => !isNaN(Number(val)), 'Start must be a valid timestamp'),
    end: z
      .string()
      .or(z.number())
      .refine((val) => !isNaN(Number(val)), 'End must be a valid timestamp'),
    step: z.string().regex(/^\d+[smhd]$/, 'Step must be in format: 15s, 1m, 1h, etc.').optional(),
  }),
};

/**
 * Validate request body against schema
 */
export function validateBody(schema) {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn({ errors: error.errors }, 'Validation error');
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            statusCode: 400,
            details: error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        });
      }
      next(error);
    }
  };
}

/**
 * Validate query parameters against schema
 */
export function validateQuery(schema) {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn({ errors: error.errors }, 'Query validation error');
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid query parameters',
            code: 'VALIDATION_ERROR',
            statusCode: 400,
            details: error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        });
      }
      next(error);
    }
  };
}

/**
 * Sanitize user input to prevent injection attacks
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  // Remove potentially dangerous characters for PromQL
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/;DROP|;DELETE|;UPDATE/gi, '') // Remove SQL-like commands
    .trim();
}

