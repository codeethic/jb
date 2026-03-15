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

  it('should allow access when user role meets minimum role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(UserRole.CHEF);
    const ctx = createMockContext(UserRole.CHEF);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow access when user role exceeds minimum role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(UserRole.SERVER);
    const ctx = createMockContext(UserRole.ADMIN);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should deny access when user role is below minimum role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(UserRole.ADMIN);
    const ctx = createMockContext(UserRole.SERVER);
    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('should allow admin access to admin-only routes', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(UserRole.ADMIN);
    const ctx = createMockContext(UserRole.ADMIN);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow all roles when minimum role is SERVER', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(UserRole.SERVER);
    for (const role of [UserRole.SERVER, UserRole.CHEF, UserRole.MANAGER, UserRole.ADMIN]) {
      const ctx = createMockContext(role);
      expect(guard.canActivate(ctx)).toBe(true);
    }
  });

  it('should deny server access to chef-level routes', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(UserRole.CHEF);
    const ctx = createMockContext(UserRole.SERVER);
    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('should deny server and chef access to manager-level routes', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(UserRole.MANAGER);
    expect(guard.canActivate(createMockContext(UserRole.SERVER))).toBe(false);
    expect(guard.canActivate(createMockContext(UserRole.CHEF))).toBe(false);
    expect(guard.canActivate(createMockContext(UserRole.MANAGER))).toBe(true);
    expect(guard.canActivate(createMockContext(UserRole.ADMIN))).toBe(true);
  });
});
