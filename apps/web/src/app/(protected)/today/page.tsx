'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { ScheduledFeature, FeatureItem, FeatureCategory } from '@featureboard/shared';

interface LineupItem extends ScheduledFeature {
  featureItem: FeatureItem & { category: FeatureCategory };
}

function getLegalDrinkingAgeDate(): string {
  const today = new Date();
  const cutoff = new Date(today.getFullYear() - 21, today.getMonth(), today.getDate());
  return cutoff.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function TodayPage() {
  const [lineup, setLineup] = useState<LineupItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<LineupItem[]>('/today')
      .then((res) => {
        if (res.data) setLineup(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading today&apos;s lineup...</p>
      </main>
    );
  }

  if (lineup.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <p className="text-muted-foreground">No features published for today.</p>
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Today&apos;s Features</h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <a
          href="/today/print"
          className="text-sm px-3 py-1.5 rounded-md border hover:bg-muted transition-colors"
        >
          Print Lineup
        </a>
      </div>

      <div className="rounded-lg border border-dashed p-3 text-center">
        <p className="text-xs text-muted-foreground">Legal drinking age: born on or before</p>
        <p className="text-sm font-semibold">{getLegalDrinkingAgeDate()}</p>
      </div>

      {lineup.map((item) => (
        <div key={item.id} className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {item.featureItem.category?.name}
            </span>
            <span className="text-xs text-muted-foreground">{item.mealPeriod}</span>
          </div>
          <h2 className="text-lg font-semibold">{item.featureItem.name}</h2>
          <p className="text-sm text-muted-foreground">{item.featureItem.description}</p>
          {item.featureItem.allergens && (
            <p className="text-xs text-destructive">⚠ {item.featureItem.allergens}</p>
          )}
          {item.notes && <p className="text-xs italic text-muted-foreground">{item.notes}</p>}
        </div>
      ))}
    </main>
  );
}
