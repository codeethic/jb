'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, AuthResponse } from '@featureboard/shared';
import { UserRole } from '@featureboard/shared';

interface AuthContextValue {
  user: Omit<User, 'createdAt' | 'updatedAt'> | null;
  token: string | null;
  loading: boolean;
  login: (accessToken: string, user: AuthResponse['user']) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthContextValue['user']>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((accessToken: string, userData: AuthResponse['user']) => {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

/** Check if a role can access a given minimum role level. */
export function hasRole(userRole: UserRole, minRole: UserRole): boolean {
  const hierarchy = [UserRole.SERVER, UserRole.CHEF, UserRole.MANAGER, UserRole.ADMIN];
  return hierarchy.indexOf(userRole) >= hierarchy.indexOf(minRole);
}
