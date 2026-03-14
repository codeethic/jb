import { hasRole } from './auth-context';
import { UserRole } from '@featureboard/shared';

describe('hasRole', () => {
  it('should allow SERVER to access SERVER-level routes', () => {
    expect(hasRole(UserRole.SERVER, UserRole.SERVER)).toBe(true);
  });

  it('should deny SERVER from CHEF-level routes', () => {
    expect(hasRole(UserRole.SERVER, UserRole.CHEF)).toBe(false);
  });

  it('should allow CHEF to access SERVER-level routes', () => {
    expect(hasRole(UserRole.CHEF, UserRole.SERVER)).toBe(true);
  });

  it('should allow CHEF to access CHEF-level routes', () => {
    expect(hasRole(UserRole.CHEF, UserRole.CHEF)).toBe(true);
  });

  it('should deny CHEF from MANAGER-level routes', () => {
    expect(hasRole(UserRole.CHEF, UserRole.MANAGER)).toBe(false);
  });

  it('should allow MANAGER to access CHEF-level routes', () => {
    expect(hasRole(UserRole.MANAGER, UserRole.CHEF)).toBe(true);
  });

  it('should allow ADMIN to access all routes', () => {
    expect(hasRole(UserRole.ADMIN, UserRole.SERVER)).toBe(true);
    expect(hasRole(UserRole.ADMIN, UserRole.CHEF)).toBe(true);
    expect(hasRole(UserRole.ADMIN, UserRole.MANAGER)).toBe(true);
    expect(hasRole(UserRole.ADMIN, UserRole.ADMIN)).toBe(true);
  });

  it('should deny SERVER from ADMIN-level routes', () => {
    expect(hasRole(UserRole.SERVER, UserRole.ADMIN)).toBe(false);
  });
});
