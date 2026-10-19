import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { OrganizationsController } from './organizations/organizations.controller.js';
import { IntegrationsController } from './integrations/integrations.controller.js';
import { InventoryController } from './inventory/inventory.controller.js';
import { TopologyController } from './inventory/topology.controller.js';
import { TelemetryController } from './telemetry/telemetry.controller.js';

@Module({
  imports: [],
  controllers: [
    HealthController,
    OrganizationsController,
    IntegrationsController,
    InventoryController,
    TopologyController,
    TelemetryController,
  ],
  providers: [],
})
export class AppModule {}
