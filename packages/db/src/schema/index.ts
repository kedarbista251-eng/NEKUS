import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  jsonb,
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
    provider: text('provider').notNull(), // 'aws', 'gcp', etc.
    accountId: text('account_id').notNull(),
    region: text('region').notNull(),
    resourceId: text('resource_id').notNull(),
    resourceType: text('resource_type').notNull(), // 'aws:ec2:instance', 'aws:ec2:vpc', etc.
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
    relationshipType: text('relationship_type').notNull(), // 'contains', 'routes_to', 'depends_on', etc.
    evidenceSource: text('evidence_source').notNull(), // 'observed_network', 'config_reference', 'vpc_peering'
    observedAt: timestamp('observed_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgRelSourceIdx: index('org_rel_source_idx').on(table.organizationId, table.sourceResourceId),
    orgRelTargetIdx: index('org_rel_target_idx').on(table.organizationId, table.targetResourceId),
  })
);
