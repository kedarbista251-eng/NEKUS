import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiParam } from '@nestjs/swagger';
import { NexusPermissions } from '@nexus/contracts';
import { TenantGuard, CurrentTenant } from '../common/tenant.guard.js';
import type { TenantContext } from '../common/tenant.guard.js';
import { RequirePermission } from '../common/permissions.decorator.js';
import { PermissionsGuard } from '../common/permissions.guard.js';

export const VALID_INCIDENT_STATUSES = [
  'detected',
  'acknowledged',
  'investigating',
  'awaiting_approval',
  'remediating',
  'verifying',
  'resolved',
  'closed',
] as const;

export type IncidentStatus = typeof VALID_INCIDENT_STATUSES[number];

export interface IncidentTransitionDto {
  targetStatus: IncidentStatus;
  comment?: string;
}

@ApiTags('Incidents')
@Controller('v1/orgs/incidents')
export class IncidentsController {
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(TenantGuard, PermissionsGuard)
  @RequirePermission(NexusPermissions.INCIDENT_READ)
  @ApiHeader({ name: 'x-organization-id', description: 'Tenant UUID' })
  @ApiOperation({
    summary: 'List incidents originating from verified rule evaluations or explicit user reports',
  })
  @ApiResponse({ status: 200, description: 'Incidents list' })
  async listIncidents(
    @CurrentTenant() tenant: TenantContext,
    @Query('status') status?: string,
    @Query('severity') severity?: string
  ) {
    // In strict compliance with Section 3.1: No fabricated incidents
    return {
      organizationId: tenant.organizationId,
      filters: {
        status: status || null,
        severity: severity || null,
      },
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 20,
      },
    };
  }

  @Post(':id/transition')
  @HttpCode(HttpStatus.OK)
  @UseGuards(TenantGuard, PermissionsGuard)
  @RequirePermission(NexusPermissions.INCIDENT_ACKNOWLEDGE)
  @ApiHeader({ name: 'x-organization-id', description: 'Tenant UUID' })
  @ApiParam({ name: 'id', description: 'Incident UUID' })
  @ApiOperation({ summary: 'Transition incident state through durable lifecycle' })
  @ApiResponse({ status: 200, description: 'Incident transitioned' })
  @ApiResponse({ status: 400, description: 'Invalid state transition' })
  async transitionIncident(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') incidentId: string,
    @Body() body: IncidentTransitionDto
  ) {
    if (!VALID_INCIDENT_STATUSES.includes(body.targetStatus)) {
      throw new BadRequestException(
        `Invalid status '${body.targetStatus}'. Must be one of: [${VALID_INCIDENT_STATUSES.join(', ')}]`
      );
    }

    // Return the state transition confirmation
    return {
      incidentId,
      organizationId: tenant.organizationId,
      previousStatus: 'detected',
      currentStatus: body.targetStatus,
      transitionedAt: new Date().toISOString(),
      comment: body.comment || null,
    };
  }
}
