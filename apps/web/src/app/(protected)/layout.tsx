'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, hasRole } from '@/lib/auth-context';
import { useTheme, type Theme } from '@/lib/theme-context';
import { UserRole } from '@featureboard/shared';
import Link from 'next/link';
import Image from 'next/image';
import banner from '../banner.svg';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', minRole: UserRole.SERVER },
  { href: '/features', label: 'Features', minRole: UserRole.SERVER },
  { href: '/schedule', label: 'Schedule', minRole: UserRole.CHEF },
  { href: '/pairings', label: 'Pairings', minRole: UserRole.SERVER },
  { href: '/today', label: "Today's Features", minRole: UserRole.SERVER },
  { href: '/admin/users', label: 'Users', minRole: UserRole.ADMIN },
  { href: '/admin/categories', label: 'Categories', minRole: UserRole.ADMIN },
];

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const { theme, setTheme, themes } = useTheme();
  const router = useRouter();

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
      <header className="border-b bg-background">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center">
              <Image src={banner} alt="FeatureBoard" width={180} height={40} priority />
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {visibleNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
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
      <main className="flex-1">{children}</main>
    </div>
  );
}
