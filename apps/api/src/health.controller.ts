import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { loadConfig } from '@nexus/config';
import pg from 'pg';
import { Redis } from 'ioredis';

const { Pool } = pg;

@ApiTags('Health')
@Controller()
export class HealthController {
  @Get('healthz')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiResponse({ status: 200, description: 'Process is alive' })
  getLiveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('readyz')
  @ApiOperation({ summary: 'Readiness probe' })
  @ApiResponse({ status: 200, description: 'All backing dependencies are ready' })
  @ApiResponse({ status: 503, description: 'One or more dependencies are unavailable' })
  async getReadiness() {
    const config = loadConfig();
    const checks: Record<string, { status: 'healthy' | 'unhealthy'; error?: string }> = {};

    // 1. Honest PostgreSQL check
    try {
      const pool = new Pool({
        connectionString: config.DATABASE_URL,
        connectionTimeoutMillis: 1500,
      });
      await pool.query('SELECT 1');
      await pool.end();
      checks.database = { status: 'healthy' };
    } catch (err: unknown) {
      checks.database = {
        status: 'unhealthy',
        error: err instanceof Error ? err.message : 'Database ping failed',
      };
    }

    // 2. Honest Redis check
    try {
      const redis = new Redis(config.REDIS_URL, {
        connectTimeout: 1500,
        lazyConnect: true,
      });
      await redis.connect();
      await redis.ping();
      redis.disconnect();
      checks.redis = { status: 'healthy' };
    } catch (err: unknown) {
      checks.redis = {
        status: 'unhealthy',
        error: err instanceof Error ? err.message : 'Redis ping failed',
      };
    }

    const allHealthy = Object.values(checks).every((c) => c.status === 'healthy');

    return {
      status: allHealthy ? 'ready' : 'degraded',
      timestamp: new Date().toISOString(),
      dependencies: checks,
    };
  }
}
