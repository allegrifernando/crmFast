import { Injectable, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export interface OwnershipScopeConfig {
  entity: string;
  ownerField: string;
  paramId?: string;
}

@Injectable()
export class OwnershipScope {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const config = this.reflector.getAllAndOverride<OwnershipScopeConfig>(
      'ownership',
      [context.getHandler(), context.getClass()],
    );

    if (!config) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user.role === 'ADMIN' || user.role === 'DIRECTOR') {
      return true;
    }

    const resourceId = request.params[config.paramId || 'id'];
    if (!resourceId) {
      return true;
    }

    if (request.resourceOwner && request.resourceOwner[config.ownerField] !== user.id) {
      throw new ForbiddenException('You do not own this resource');
    }

    return true;
  }
}
