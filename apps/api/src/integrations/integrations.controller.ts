import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiBody } from '@nestjs/swagger';
import { NexusPermissions } from '@nexus/contracts';
import {
  AwsProviderAdapter,
  AwsIntegrationConfigSchema,
} from '@nexus/providers-aws';
import type { AwsIntegrationConfig } from '@nexus/providers-aws';
import { TenantGuard, CurrentTenant } from '../common/tenant.guard.js';
import type { TenantContext } from '../common/tenant.guard.js';
import { RequirePermission } from '../common/permissions.decorator.js';
import { PermissionsGuard } from '../common/permissions.guard.js';

@ApiTags('Integrations')
@Controller('v1/orgs/integrations')
export class IntegrationsController {
  private awsAdapter: AwsProviderAdapter;

  constructor() {
    this.awsAdapter = new AwsProviderAdapter();
  }

  @Post('aws/test-connection')
  @HttpCode(HttpStatus.OK)
  @UseGuards(TenantGuard, PermissionsGuard)
  @RequirePermission(NexusPermissions.INTEGRATION_CREATE)
  @ApiHeader({ name: 'x-organization-id', description: 'Tenant UUID' })
  @ApiOperation({
    summary: 'Test AWS cross-account connection via STS AssumeRole without fabricating success',
  })
  @ApiResponse({ status: 200, description: 'Real connection test outcome' })
  @ApiResponse({ status: 400, description: 'Invalid configuration payload' })
  async testAwsConnection(
    @CurrentTenant() tenant: TenantContext,
    @Body() body: AwsIntegrationConfig
  ) {
    const parsed = AwsIntegrationConfigSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Invalid AWS integration configuration',
        issues: parsed.error.issues,
      });
    }

    // Call real AWS AssumeRole check
    const result = await this.awsAdapter.testConnection(parsed.data);

    return {
      organizationId: tenant.organizationId,
      provider: 'aws',
      result,
    };
  }
}
