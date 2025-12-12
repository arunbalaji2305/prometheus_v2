import { logger } from '../config/logger.js';

/**
 * Unified error response format
 */
function formatErrorResponse(error, statusCode) {
  return {
    success: false,
    error: {
      message: error.message || 'An unexpected error occurred',
      code: error.code || 'INTERNAL_ERROR',
      statusCode,
    },
  };
}

/**
 * Sanitize error message to remove API keys
 */
function sanitizeError(message) {
  if (!message) return message;
  return message.replace(/key=AIza[A-Za-z0-9_-]{35}/g, 'key=***REDACTED***')
                .replace(/AIza[A-Za-z0-9_-]{35}/g, '***REDACTED***');
}

/**
 * Global error handling middleware
 */
export function errorHandler(err, req, res, _next) {
  // Log the error with sanitized stack trace
  logger.error(
    {
      error: sanitizeError(err.message),
      stack: sanitizeError(err.stack),
      url: req.url,
      method: req.method,
    },
    'Request error'
  );

  // Determine status code
  let statusCode = err.statusCode || 500;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
  } else if (err.message?.includes('not found')) {
    statusCode = 404;
  } else if (err.message?.includes('unauthorized') || err.message?.includes('API key')) {
    statusCode = 401;
  } else if (err.message?.includes('quota') || err.message?.includes('rate limit')) {
    statusCode = 429;
  }

  // Send error response
  res.status(statusCode).json(formatErrorResponse(err, statusCode));
}

/**
 * 404 handler for undefined routes
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.url} not found`,
      code: 'NOT_FOUND',
      statusCode: 404,
    },
  });
}

/**
 * Async route wrapper to catch errors
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

