import { describe, it, expect } from 'vitest';
import { sampleHealthActivity, runWorker } from './worker.js';

describe('Worker Module Verification', () => {
  it('should execute sample health activity with standard timestamp and status', async () => {
    const res = await sampleHealthActivity();
    expect(res.status).toBe('healthy');
    expect(res.timestamp).toBeDefined();
  });

  it('should initialize worker configuration adhering to task queue contracts', async () => {
    const res = await runWorker();
    expect(res.initialized).toBe(true);
    expect(res.taskQueue).toBe('nexus-main-queue');
  });
});
