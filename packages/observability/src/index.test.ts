import { describe, it, expect } from 'vitest';
import { createLogger, REDACTED_PATHS } from './index.js';

describe('Observability Logger Verification', () => {
  it('should include sensitive authentication keys in default redaction paths', () => {
    expect(REDACTED_PATHS).toContain('password');
    expect(REDACTED_PATHS).toContain('authorization');
    expect(REDACTED_PATHS).toContain('secret');
  });

  it('should instantiate logger instance with service name', () => {
    const logger = createLogger('nexus-test-service');
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
  });
});
