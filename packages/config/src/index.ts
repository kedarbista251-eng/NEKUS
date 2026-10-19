import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  PORT: z.coerce.number().int().min(1000).max(65535).default(4000),

  // Security & Authentication
  BETTER_AUTH_SECRET: z.string().min(16).default('development-insecure-secret-32-chars-long'),
  BETTER_AUTH_URL: z.string().url().default('http://localhost:4000'),

  // Primary Database
  DATABASE_URL: z.string().min(1).default('postgresql://postgres:postgres@localhost:5432/nexus'),
  DATABASE_MAX_CONNECTIONS: z.coerce.number().int().min(1).max(100).default(20),

  // Redis Cache
  REDIS_URL: z.string().min(1).default('redis://localhost:6379'),

  // Temporal Orchestration
  TEMPORAL_ADDRESS: z.string().min(1).default('localhost:7233'),
  TEMPORAL_NAMESPACE: z.string().min(1).default('default'),
  TEMPORAL_TASK_QUEUE: z.string().min(1).default('nexus-main-queue'),

  // AWS Configuration
  AWS_REGION: z.string().default('us-east-1'),
  AWS_EXTERNAL_ID_SALT: z.string().default('nexus-external-id-salt'),

  // Intelligence Service
  INTELLIGENCE_SERVICE_URL: z.string().url().default('http://localhost:8000'),
  INTELLIGENCE_SERVICE_API_KEY: z.string().default('internal-intel-key'),

  // Observability
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().default('http://localhost:4318'),
  OTEL_SERVICE_NAME: z.string().default('nexus-api'),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

export function loadConfig(overrides?: Record<string, unknown>): EnvConfig {
  const result = EnvSchema.safeParse({ ...process.env, ...overrides });
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    throw new Error(`[NEXUS CONFIG ERROR] Invalid runtime configuration: ${issues}`);
  }
  return result.data;
}
