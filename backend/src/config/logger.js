import pino from 'pino';
import pinoHttp from 'pino-http';
import { config } from './env.js';

// Create base logger
export const logger = pino({
  level: config.isDevelopment ? 'debug' : 'info',
  transport: config.isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  redact: {
    paths: [
      'req.headers.authorization', 
      'req.headers["x-api-key"]', 
      '*.apiKey', 
      '*.password',
      '*.geminiApiKey',
      'env.GEMINI_API_KEY',
      'process.env.GEMINI_API_KEY'
    ],
    remove: true,
  },
});

// HTTP request logger middleware
export const httpLogger = pinoHttp({
  logger,
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    if (res.statusCode >= 300) return 'info';
    return 'debug';
  },
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      remoteAddress: req.remoteAddress,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});

