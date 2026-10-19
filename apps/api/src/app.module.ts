import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { OrganizationsController } from './organizations/organizations.controller.js';
import { IntegrationsController } from './integrations/integrations.controller.js';

@Module({
  imports: [],
  controllers: [HealthController, OrganizationsController, IntegrationsController],
  providers: [],
})
export class AppModule {}
