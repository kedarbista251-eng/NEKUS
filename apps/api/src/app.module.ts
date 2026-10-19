import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { OrganizationsController } from './organizations/organizations.controller.js';

@Module({
  imports: [],
  controllers: [HealthController, OrganizationsController],
  providers: [],
})
export class AppModule {}
