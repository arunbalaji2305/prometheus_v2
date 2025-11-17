import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('4000'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  PROMETHEUS_URL: z.string().url().default('http://localhost:9090'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    return {
      port: parseInt(env.PORT, 10),
      geminiApiKey: env.GEMINI_API_KEY,
      prometheusUrl: env.PROMETHEUS_URL,
      nodeEnv: env.NODE_ENV,
      isDevelopment: env.NODE_ENV === 'development',
      isProduction: env.NODE_ENV === 'production',
    };
  } catch (error) {
    console.error('❌ Invalid environment variables:', error.errors);
    process.exit(1);
  }
}

export const config = validateEnv();

