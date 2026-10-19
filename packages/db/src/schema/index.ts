import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  jsonb,
  integer,
  primaryKey,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// 1. Users Entity
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 2. User Sessions (Better Auth compatible)
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 3. Organizations (Tenants)
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  logo: text('logo'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 4. Roles
export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  isSystem: boolean('is_system').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 5. Role Permissions
export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permission: text('permission').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.roleId, table.permission] }),
  })
);

// 6. Organization Memberships
export const memberships = pgTable(
  'memberships',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgUserIdx: index('org_user_idx').on(table.organizationId, table.userId),
  })
);

// 7. Append-Only Audit Events
export const auditEvents = pgTable(
  'audit_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
    action: text('action').notNull(),
    targetType: text('target_type').notNull(),
    targetId: text('target_id').notNull(),
    details: jsonb('details').notNull(),
    correlationId: uuid('correlation_id').notNull(),
    ipAddress: text('ip_address'),
    timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgAuditIdx: index('org_audit_idx').on(table.organizationId, table.timestamp),
  })
);

// 8. Cloud Resources (Discovered inventory)
export const cloudResources = pgTable(
  'cloud_resources',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(),
    accountId: text('account_id').notNull(),
    region: text('region').notNull(),
    resourceId: text('resource_id').notNull(),
    resourceType: text('resource_type').notNull(),
    arn: text('arn').notNull(),
    name: text('name'),
    status: text('status').default('active').notNull(),
    tags: jsonb('tags').notNull().default({}),
    properties: jsonb('properties').notNull().default({}),
    discoveredAt: timestamp('discovered_at', { withTimezone: true }).defaultNow().notNull(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgResourceUnique: uniqueIndex('org_resource_unique_idx').on(
      table.organizationId,
      table.provider,
      table.accountId,
      table.arn
    ),
    orgResTypeIdx: index('org_res_type_idx').on(table.organizationId, table.resourceType),
  })
);

// 9. Resource Relationships (Dependency Graph Edges)
export const resourceRelationships = pgTable(
  'resource_relationships',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    sourceResourceId: uuid('source_resource_id')
      .notNull()
      .references(() => cloudResources.id, { onDelete: 'cascade' }),
    targetResourceId: uuid('target_resource_id')
      .notNull()
      .references(() => cloudResources.id, { onDelete: 'cascade' }),
    relationshipType: text('relationship_type').notNull(),
    evidenceSource: text('evidence_source').notNull(),
    observedAt: timestamp('observed_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgRelSourceIdx: index('org_rel_source_idx').on(table.organizationId, table.sourceResourceId),
    orgRelTargetIdx: index('org_rel_target_idx').on(table.organizationId, table.targetResourceId),
  })
);

// 10. Telemetry Sources
export const telemetrySources = pgTable(
  'telemetry_sources',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    sourceType: text('source_type').notNull(),
    ingestTokenHash: text('ingest_token_hash').notNull().unique(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgSourceIdx: index('org_telemetry_source_idx').on(table.organizationId, table.sourceType),
  })
);

// 11. Telemetry Events
export const telemetryEvents = pgTable(
  'telemetry_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    sourceId: uuid('source_id')
      .notNull()
      .references(() => telemetrySources.id, { onDelete: 'cascade' }),
    eventType: text('event_type').notNull(),
    resourceArn: text('resource_arn'),
    idempotencyKey: text('idempotency_key').notNull(),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
    ingestedAt: timestamp('ingested_at', { withTimezone: true }).defaultNow().notNull(),
    payload: jsonb('payload').notNull(),
  },
  (table) => ({
    orgDedupIdx: uniqueIndex('org_event_dedup_idx').on(
      table.organizationId,
      table.idempotencyKey
    ),
    orgTimeIdx: index('org_telemetry_time_idx').on(table.organizationId, table.timestamp),
  })
);

// 12. Alert Rules
export const alertRules = pgTable(
  'alert_rules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    severity: text('severity').notNull(), // 'critical', 'warning', 'info'
    condition: jsonb('condition').notNull(), // metric query, threshold, duration
    isEnabled: boolean('is_enabled').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgAlertRulesIdx: index('org_alert_rules_idx').on(table.organizationId, table.isEnabled),
  })
);

// 13. Durable Incidents
export const incidents = pgTable(
  'incidents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    alertRuleId: uuid('alert_rule_id').references(() => alertRules.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    severity: text('severity').notNull(), // 'critical', 'high', 'medium', 'low'
    status: text('status').default('detected').notNull(), // 'detected', 'acknowledged', 'investigating', 'awaiting_approval', 'remediating', 'verifying', 'resolved', 'closed'
    source: text('source').notNull(), // 'alert_rule', 'user_reported', 'cloud_event'
    assignedToUserId: uuid('assigned_to_user_id').references(() => users.id, { onDelete: 'set null' }),
    detectedAt: timestamp('detected_at', { withTimezone: true }).defaultNow().notNull(),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    closedAt: timestamp('closed_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgIncidentStatusIdx: index('org_incident_status_idx').on(table.organizationId, table.status),
    orgIncidentTimeIdx: index('org_incident_time_idx').on(table.organizationId, table.detectedAt),
  })
);

// 14. Incident Evidence (Persisted observations, telemetry traces, and configuration snapshots)
export const incidentEvidence = pgTable(
  'incident_evidence',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    incidentId: uuid('incident_id')
      .notNull()
      .references(() => incidents.id, { onDelete: 'cascade' }),
    evidenceType: text('evidence_type').notNull(), // 'metric_anomaly', 'error_log', 'cloudtrail_mutation', 'topology_blast_radius'
    sourceIdentifier: text('source_identifier').notNull(),
    confidence: integer('confidence').notNull().default(100),
    data: jsonb('data').notNull(),
    recordedAt: timestamp('recorded_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgEvidenceIncidentIdx: index('org_evidence_incident_idx').on(table.organizationId, table.incidentId),
  })
);
