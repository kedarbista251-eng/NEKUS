import { SetMetadata } from '@nestjs/common';
import { NexusPermission } from '@nexus/contracts';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermission = (...permissions: NexusPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
