import { describe, it, expect } from 'vitest';
import {
  NexusPermissions,
  ErrorEnvelopeSchema,
  DomainEventEnvelopeSchema,
  PaginationQuerySchema,
} from './index.js';

describe('Contracts & Schemas Verification', () => {
  it('should define core permissions as non-empty immutable constants', () => {
    expect(NexusPermissions.ORG_READ).toBe('org:read');
    expect(NexusPermissions.REMEDIATION_APPROVE).toBe('remediation:approve');
    expect(Object.keys(NexusPermissions).length).toBeGreaterThan(10);
  });

  it('should validate standard error envelope structure', () => {
    const validEnvelope = {
      statusCode: 404,
      error: 'NotFound',
      message: 'The requested resource was not found',
      correlationId: '123e4567-e89b-12d3-a456-426614174000',
      timestamp: new Date().toISOString(),
    };
    const result = ErrorEnvelopeSchema.safeParse(validEnvelope);
    expect(result.success).toBe(true);
  });

  it('should reject malformed domain event envelopes missing required tenant context', () => {
    const invalidEvent = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      // missing tenantId
      eventType: 'cloud.resource.discovered',
      timestamp: new Date().toISOString(),
      correlationId: '123e4567-e89b-12d3-a456-426614174000',
      payload: {},
    };
    const result = DomainEventEnvelopeSchema.safeParse(invalidEvent);
    expect(result.success).toBe(false);
  });

  it('should parse and default pagination query parameters', () => {
    const parsed = PaginationQuerySchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(20);
  });
});
