import { describe, it, expect } from 'vitest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { TenantGuard } from './tenant.guard.js';

describe('TenantGuard Multi-Tenancy Isolation', () => {
  const guard = new TenantGuard();

  function createMockContext(headers: Record<string, string> = {}, params: Record<string, string> = {}): ExecutionContext {
    const req = {
      headers,
      params,
      tenant: undefined,
    };
    return {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    } as unknown as ExecutionContext;
  }

  it('should accept valid UUID header and populate request.tenant', () => {
    const validOrgId = 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d';
    const ctx = createMockContext({ 'x-organization-id': validOrgId });
    const result = guard.canActivate(ctx);
    expect(result).toBe(true);
    const req = ctx.switchToHttp().getRequest();
    expect(req.tenant?.organizationId).toBe(validOrgId);
  });

  it('should reject requests without tenant context with UnauthorizedException', () => {
    const ctx = createMockContext();
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('should reject invalid non-UUID tenant identifiers to prevent SQL injection or path traversal', () => {
    const ctx = createMockContext({ 'x-organization-id': "1' OR '1'='1" });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });
});
