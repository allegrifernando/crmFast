import { SetMetadata } from '@nestjs/common';
import { OwnershipScopeConfig } from './ownership.scope';

export const RequireOwnership = (config: OwnershipScopeConfig) =>
  SetMetadata('ownership', config);
