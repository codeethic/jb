'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, hasRole } from '@/lib/auth-context';
import { UserRole } from '@featureboard/shared';
import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', minRole: UserRole.SERVER },
  { href: '/features', label: 'Features', minRole: UserRole.SERVER },
  { href: '/schedule', label: 'Schedule', minRole: UserRole.CHEF },
  { href: '/pairings', label: 'Pairings', minRole: UserRole.SERVER },
  { href: '/today', label: "Today's Lineup", minRole: UserRole.SERVER },
];

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
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
            <Link href="/dashboard" className="font-bold text-lg">
              FeatureBoard
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
