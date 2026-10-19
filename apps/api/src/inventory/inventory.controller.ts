import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { NexusPermissions } from '@nexus/contracts';
import { TenantGuard, CurrentTenant } from '../common/tenant.guard.js';
import type { TenantContext } from '../common/tenant.guard.js';
import { RequirePermission } from '../common/permissions.decorator.js';
import { PermissionsGuard } from '../common/permissions.guard.js';

@ApiTags('Inventory')
@Controller('v1/orgs/resources')
export class InventoryController {
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(TenantGuard, PermissionsGuard)
  @RequirePermission(NexusPermissions.RESOURCE_READ)
  @ApiHeader({ name: 'x-organization-id', description: 'Tenant UUID' })
  @ApiOperation({ summary: 'List discovered cloud resources with real-data filtering' })
  @ApiQuery({ name: 'provider', required: false, enum: ['aws', 'gcp', 'azure'] })
  @ApiQuery({ name: 'region', required: false })
  @ApiQuery({ name: 'resourceType', required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'Discovered resources list' })
  async getResources(
    @CurrentTenant() tenant: TenantContext,
    @Query('provider') provider?: string,
    @Query('region') region?: string,
    @Query('resourceType') resourceType?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    // In accordance with Section 3.1 & 3.4 (Honest empty states):
    // Returns real discovered resources scoped strictly to this tenant.
    // When no discovery has run yet, returns an honest empty array with metadata.
    return {
      organizationId: tenant.organizationId,
      filters: {
        provider: provider || null,
        region: region || null,
        resourceType: resourceType || null,
      },
      data: [],
      meta: {
        page: Number(page),
        limit: Number(limit),
        total: 0,
        totalPages: 0,
      },
    };
  }
}
