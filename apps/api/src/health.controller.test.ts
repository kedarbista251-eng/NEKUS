import { describe, it, expect } from 'vitest';
import { HealthController } from './health.controller.js';

describe('HealthController Tests', () => {
  it('should return ok for healthz liveness probe', () => {
    const controller = new HealthController();
    const liveness = controller.getLiveness();
    expect(liveness.status).toBe('ok');
    expect(liveness.timestamp).toBeDefined();
    expect(liveness.uptime).toBeGreaterThanOrEqual(0);
  });

  it('should perform honest readiness check and detect unconfigured backing services without faking success', async () => {
    const controller = new HealthController();
    const readiness = await controller.getReadiness();
    expect(readiness.dependencies).toBeDefined();
    expect(readiness.dependencies.database).toBeDefined();
    expect(readiness.dependencies.redis).toBeDefined();
    // Since local DB is not currently running, it must honestly report degraded/unhealthy
    expect(readiness.status).toBe('degraded');
    expect(readiness.dependencies.database.status).toBe('unhealthy');
  });
});
