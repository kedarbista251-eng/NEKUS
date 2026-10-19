import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import { Request } from 'express';

export interface TenantContext {
  organizationId: string;
  userId?: string;
  roleId?: string;
}

declare global {
  namespace Express {
    interface Request {
      tenant?: TenantContext;
    }
  }
}

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Extract tenant ID strictly from header or path param
    const rawHeader = request.headers['x-organization-id'];
    const orgIdHeader = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
    const rawParam = request.params?.orgId;
    const orgIdParam = Array.isArray(rawParam) ? rawParam[0] : rawParam;

    const organizationId = orgIdHeader || orgIdParam;

    if (!organizationId) {
      throw new UnauthorizedException(
        'Missing tenant context: x-organization-id header or orgId route parameter is required.'
      );
    }

    // Basic UUID validation regex to ensure sanitized tenant ID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(organizationId)) {
      throw new UnauthorizedException('Invalid tenant context format. Tenant ID must be a valid UUID.');
    }

    request.tenant = {
      organizationId,
    };

    return true;
  }
}

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TenantContext => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if (!request.tenant) {
      throw new UnauthorizedException('Tenant context not resolved for this request.');
    }
    return request.tenant;
  }
);
