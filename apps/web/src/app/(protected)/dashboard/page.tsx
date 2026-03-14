'use client';

import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@featureboard/shared';

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Feature Library"
          description="Manage your menu features"
          href="/features"
        />
        <DashboardCard
          title="Weekly Schedule"
          description="Plan features for the week"
          href="/schedule"
        />
        <DashboardCard
          title="Wine Pairings"
          description="Manage food and wine pairings"
          href="/pairings"
        />
        <DashboardCard
          title="Today's Features"
          description="View today's published features"
          href="/today"
        />
        {isAdmin && (
          <>
            <DashboardCard
              title="Manage Users"
              description="Add, edit, or deactivate users"
              href="/admin/users"
            />
            <DashboardCard
              title="Manage Categories"
              description="Configure feature categories"
              href="/admin/categories"
            />
          </>
        )}
      </div>
    </main>
  );
}

function DashboardCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="block rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </a>
  );
}
