import { describe, it, expect } from 'vitest';
import { loadConfig, EnvSchema } from './index.js';

describe('Config Module Verification', () => {
  it('should load default configuration safely in development mode', () => {
    const config = loadConfig({ NODE_ENV: 'test', PORT: 5050 });
    expect(config.NODE_ENV).toBe('test');
    expect(config.PORT).toBe(5050);
    expect(config.DATABASE_URL).toContain('postgresql://');
  });

  it('should fail fast with descriptive error on invalid port or url', () => {
    expect(() =>
      loadConfig({
        PORT: 99999, // Out of valid port range
      })
    ).toThrow('[NEXUS CONFIG ERROR]');
  });
});
