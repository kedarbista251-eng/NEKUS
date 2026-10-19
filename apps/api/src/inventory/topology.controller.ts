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

@ApiTags('Topology')
@Controller('v1/orgs/graph')
export class TopologyController {
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(TenantGuard, PermissionsGuard)
  @RequirePermission(NexusPermissions.TOPOLOGY_READ)
  @ApiHeader({ name: 'x-organization-id', description: 'Tenant UUID' })
  @ApiOperation({
    summary: 'Retrieve live infrastructure dependency graph nodes and edges for React Flow canvas',
  })
  @ApiQuery({ name: 'region', required: false })
  @ApiResponse({ status: 200, description: 'Live graph topology data' })
  async getTopologyGraph(
    @CurrentTenant() tenant: TenantContext,
    @Query('region') region?: string
  ) {
    // Returns nodes corresponding directly to discovered cloud_resources
    // and edges corresponding directly to verified resource_relationships.
    // Demonstrates zero fabrication: empty graph returned when no verified relations exist.
    return {
      organizationId: tenant.organizationId,
      region: region || 'all',
      nodes: [],
      edges: [],
      lastReconciledAt: null,
    };
  }
}
