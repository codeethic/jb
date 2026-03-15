import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@featureboard/shared';
import { ROLES_KEY } from '../decorators/roles.decorator';

const ROLE_HIERARCHY: UserRole[] = [
  UserRole.SERVER,
  UserRole.CHEF,
  UserRole.MANAGER,
  UserRole.ADMIN,
];

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const minRole = this.reflector.getAllAndOverride<UserRole>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!minRole) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return ROLE_HIERARCHY.indexOf(user.role) >= ROLE_HIERARCHY.indexOf(minRole);
  }
}
