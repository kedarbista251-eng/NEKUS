import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { NexusPermissions } from '@nexus/contracts';
import { TenantGuard, CurrentTenant } from '../common/tenant.guard.js';
import type { TenantContext } from '../common/tenant.guard.js';
import { RequirePermission } from '../common/permissions.decorator.js';
import { PermissionsGuard } from '../common/permissions.guard.js';

export interface CreateOrganizationDto {
  name: string;
  slug: string;
}

@ApiTags('Organizations')
@Controller('v1/orgs')
export class OrganizationsController {
  @Get('current')
  @UseGuards(TenantGuard)
  @ApiHeader({ name: 'x-organization-id', description: 'Tenant UUID' })
  @ApiOperation({ summary: 'Get current organization details' })
  @ApiResponse({ status: 200, description: 'Organization retrieved' })
  async getCurrentOrg(@CurrentTenant() tenant: TenantContext) {
    return {
      id: tenant.organizationId,
      status: 'active',
      retrievedAt: new Date().toISOString(),
    };
  }

  @Get('audit-log')
  @UseGuards(TenantGuard, PermissionsGuard)
  @RequirePermission(NexusPermissions.AUDIT_READ)
  @ApiHeader({ name: 'x-organization-id', description: 'Tenant UUID' })
  @ApiOperation({ summary: 'Retrieve append-only audit trail' })
  @ApiResponse({ status: 200, description: 'Audit events returned' })
  @ApiResponse({ status: 403, description: 'Forbidden: Missing audit:read permission' })
  async getAuditLog(@CurrentTenant() tenant: TenantContext) {
    return {
      organizationId: tenant.organizationId,
      events: [],
      meta: {
        total: 0,
        page: 1,
        limit: 20,
      },
    };
  }
}
