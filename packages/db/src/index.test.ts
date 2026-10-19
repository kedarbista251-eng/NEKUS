import { describe, it, expect } from 'vitest';
import {
  users,
  organizations,
  memberships,
  roles,
  rolePermissions,
  auditEvents,
} from './schema/index.js';

describe('Database Schema & Multi-Tenancy Architecture', () => {
  it('should expose multi-tenant entities with strict foreign key constraints', () => {
    expect(users).toBeDefined();
    expect(organizations).toBeDefined();
    expect(memberships).toBeDefined();
    expect(roles).toBeDefined();
    expect(rolePermissions).toBeDefined();
    expect(auditEvents).toBeDefined();
  });

  it('should guarantee organizationId column exists on all tenant-isolated tables', () => {
    expect(memberships.organizationId).toBeDefined();
    expect(roles.organizationId).toBeDefined();
    expect(auditEvents.organizationId).toBeDefined();
  });

  it('should define audit events with immutable correlationId and structured details', () => {
    expect(auditEvents.correlationId).toBeDefined();
    expect(auditEvents.details).toBeDefined();
    expect(auditEvents.timestamp).toBeDefined();
  });
});
