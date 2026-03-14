import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from '@featureboard/shared';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  function createMockContext(userRole: UserRole): ExecutionContext {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: userRole } }),
      }),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should allow access when no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const ctx = createMockContext(UserRole.SERVER);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow access when user role is in required roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.CHEF, UserRole.ADMIN]);
    const ctx = createMockContext(UserRole.CHEF);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should deny access when user role is not in required roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
    const ctx = createMockContext(UserRole.SERVER);
    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('should allow admin access to admin-only routes', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
    const ctx = createMockContext(UserRole.ADMIN);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow access when empty roles array', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
    const ctx = createMockContext(UserRole.SERVER);
    expect(guard.canActivate(ctx)).toBe(true);
  });
});
