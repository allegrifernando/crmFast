import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../../prisma/prisma.service';

export interface RequiredPermission {
  module: string;
  action: string;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<RequiredPermission[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('No authenticated user');
    }

    for (const perm of requiredPermissions) {
      const hasPermission = await this.prisma.permission.findFirst({
        where: {
          roleId: user.roleId,
          module: perm.module,
          action: perm.action,
        },
      });

      if (!hasPermission) {
        throw new ForbiddenException(
          `Missing permission: ${perm.module}:${perm.action}`,
        );
      }
    }

    return true;
  }
}
