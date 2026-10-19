import { z } from 'zod';

export const NexusPermissions = {
  // Organizations
  ORG_READ: 'org:read',
  ORG_UPDATE: 'org:update',
  ORG_DELETE: 'org:delete',
  ORG_MANAGE_MEMBERS: 'org:manage_members',

  // Cloud Integrations
  INTEGRATION_READ: 'integration:read',
  INTEGRATION_CREATE: 'integration:create',
  INTEGRATION_UPDATE: 'integration:update',
  INTEGRATION_DELETE: 'integration:delete',
  INTEGRATION_SYNC: 'integration:sync',

  // Infrastructure & Resources
  RESOURCE_READ: 'resource:read',
  TOPOLOGY_READ: 'topology:read',

  // Telemetry & Monitoring
  TELEMETRY_READ: 'telemetry:read',
  TELEMETRY_INGEST: 'telemetry:ingest',

  // Alerting & Incidents
  ALERT_READ: 'alert:read',
  ALERT_MANAGE: 'alert:manage',
  INCIDENT_READ: 'incident:read',
  INCIDENT_ACKNOWLEDGE: 'incident:acknowledge',
  INCIDENT_RESOLVE: 'incident:resolve',

  // Remediation & Approvals
  REMEDIATION_PROPOSE: 'remediation:propose',
  REMEDIATION_APPROVE: 'remediation:approve',
  REMEDIATION_EXECUTE: 'remediation:execute',

  // Cost & Reliability
  COST_READ: 'cost:read',
  SLO_READ: 'slo:read',
  SLO_MANAGE: 'slo:manage',

  // Audit & Settings
  AUDIT_READ: 'audit:read',
  SETTINGS_MANAGE: 'settings:manage',
} as const;

export type NexusPermission = typeof NexusPermissions[keyof typeof NexusPermissions];

export const ErrorEnvelopeSchema = z.object({
  statusCode: z.number().int().min(400).max(599),
  error: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
  correlationId: z.string().uuid(),
  timestamp: z.string().datetime(),
});

export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    meta: z.object({
      page: z.number().int(),
      limit: z.number().int(),
      total: z.number().int(),
      totalPages: z.number().int(),
    }),
  });

export const DomainEventEnvelopeSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  eventType: z.string().min(1),
  schemaVersion: z.number().int().min(1).default(1),
  timestamp: z.string().datetime(),
  correlationId: z.string().uuid(),
  payload: z.record(z.unknown()),
});

export type DomainEventEnvelope = z.infer<typeof DomainEventEnvelopeSchema>;
