import { SetMetadata } from '@nestjs/common';
import { RequiredPermission } from './permissions.guard';

export const RequirePermissions = (...permissions: RequiredPermission[]) =>
  SetMetadata('permissions', permissions);
