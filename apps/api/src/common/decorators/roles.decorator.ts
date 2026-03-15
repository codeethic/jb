import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@featureboard/shared';

export const ROLES_KEY = 'roles';
export const Roles = (minRole: UserRole) => SetMetadata(ROLES_KEY, minRole);
