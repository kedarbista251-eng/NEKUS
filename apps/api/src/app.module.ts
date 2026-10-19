import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { OrganizationsController } from './organizations/organizations.controller.js';
import { IntegrationsController } from './integrations/integrations.controller.js';
import { InventoryController } from './inventory/inventory.controller.js';
import { TopologyController } from './inventory/topology.controller.js';

@Module({
  imports: [],
  controllers: [
    HealthController,
    OrganizationsController,
    IntegrationsController,
    InventoryController,
    TopologyController,
  ],
  providers: [],
})
export class AppModule {}
