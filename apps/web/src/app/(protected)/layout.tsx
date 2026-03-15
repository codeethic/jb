'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, hasRole } from '@/lib/auth-context';
import { useTheme, type Theme } from '@/lib/theme-context';
import { UserRole } from '@featureboard/shared';
import Link from 'next/link';
import Image from 'next/image';
import banner from '../banner.svg';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', minRole: UserRole.SERVER },
  { href: '/features', label: 'Features', minRole: UserRole.CHEF },
  { href: '/schedule', label: 'Schedule', minRole: UserRole.CHEF },
  { href: '/pairings', label: 'Pairings', minRole: UserRole.SERVER },
  { href: '/today', label: "Today's Features", minRole: UserRole.SERVER },
  { href: '/admin/users', label: 'Users', minRole: UserRole.MANAGER },
  { href: '/admin/categories', label: 'Categories', minRole: UserRole.ADMIN },
];

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const { theme, setTheme, themes } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const visibleNav = NAV_ITEMS.filter((item) => hasRole(user.role, item.minRole));

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="border-b bg-background print:hidden">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="md:hidden p-1.5 rounded-md hover:bg-muted text-muted-foreground"
              aria-label="Toggle navigation"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="5" x2="17" y2="5" />
                <line x1="3" y1="10" x2="17" y2="10" />
                <line x1="3" y1="15" x2="17" y2="15" />
              </svg>
            </button>
            <Link href="/dashboard" className="flex items-center">
              <Image src={banner} alt="FeatureBoard" width={180} height={40} priority />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as Theme)}
              className="text-xs rounded-md border bg-background px-2 py-1 outline-none"
            >
              {themes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <span className="text-xs text-muted-foreground">
              {user.name}{' '}
              <span className="uppercase font-medium">({user.role})</span>
            </span>
            <button
              onClick={() => {
                logout();
                router.replace('/login');
              }}
              className="text-sm px-3 py-1.5 rounded-md border hover:bg-muted transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`print:hidden border-r bg-background flex-shrink-0 transition-all duration-200 ${
            collapsed ? 'w-0 overflow-hidden md:w-12' : 'w-56'
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="hidden md:flex items-center justify-end px-2 py-2">
              <button
                onClick={() => setCollapsed((c) => !c)}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform ${collapsed ? 'rotate-180' : ''}`}
                >
                  <polyline points="10 3 5 8 10 13" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 flex flex-col gap-0.5 px-2">
              {visibleNav.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    } ${collapsed ? 'justify-center px-0' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className={collapsed ? 'hidden' : ''}>{item.label}</span>
                    {collapsed && (
                      <span className="text-xs font-medium">{item.label.charAt(0)}</span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
