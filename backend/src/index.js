// src/index.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import client from 'prom-client';

import { config } from './config/env.js';
import { logger, httpLogger } from './config/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Import routes
import healthRoutes from './routes/health.routes.js';
import nl2promqlRoutes from './routes/nl2promql.routes.js';
import prometheusRoutes from './routes/prometheus.routes.js';
import debugRoutes from './routes/debug.routes.js';

const app = express();

/* ============================
   Prometheus Metrics Setup
   ============================ */

// Create a registry to register all metrics
const register = new client.Registry();

// Collect default Node.js metrics (CPU, memory, event loop, etc.)
client.collectDefaultMetrics({ register });

// Create custom metrics
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});
register.registerMetric(httpRequestsTotal);

const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});
register.registerMetric(httpRequestDurationSeconds);

// Middleware for tracking requests
app.use((req, res, next) => {
  const endTimer = httpRequestDurationSeconds.startTimer();
  res.on('finish', () => {
    const route = req.route?.path || req.path || 'unknown';
    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode,
    });
    endTimer({
      method: req.method,
      route,
      status_code: res.statusCode,
    });
  });
  next();
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  try {
    res.setHeader('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.status(200).send(metrics);
  } catch (err) {
    res.status(500).send('Error generating metrics');
  }
});

/* ============================
   Security Middleware
   ============================ */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin: config.isDevelopment
      ? ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173']
      : process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  })
);

// Rate limiting (only affects /api routes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.isDevelopment ? 200 : 100,
  message: {
    success: false,
    error: {
      message: 'Too many requests, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      statusCode: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging
app.use(httpLogger);

/* ============================
   API Routes
   ============================ */
app.use('/api/health', healthRoutes);
app.use('/api/nl2promql', nl2promqlRoutes);
app.use('/api/prometheus', prometheusRoutes);
app.use('/api/debug', debugRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Natural Language to PromQL API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      nl2promql: 'POST /api/nl2promql',
      queryRange: 'GET /api/prometheus/query_range',
      metrics: 'GET /metrics',
    },
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

/* ============================
   Start Server
   ============================ */
const server = app.listen(config.port, () => {
  logger.info(
    {
      port: config.port,
      host: 'all-interfaces',
      env: config.nodeEnv,
      prometheusUrl: config.prometheusUrl,
    },
    '🚀 Server started successfully'
  );
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    logger.error({ port: config.port }, 'Port is already in use');
  } else {
    logger.error({ error: error.message }, 'Server error');
  }
  process.exit(1);
});

/* ============================
   Graceful Shutdown
   ============================ */
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app;
