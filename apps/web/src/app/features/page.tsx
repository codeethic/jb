'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { FeatureItem, FeatureCategory } from '@featureboard/shared';
import { calculateMargin } from '@featureboard/shared';

interface FeatureItemWithCategory extends FeatureItem {
  category?: FeatureCategory;
  marginPercent?: number;
}

export default function FeaturesPage() {
  const [features, setFeatures] = useState<FeatureItemWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<FeatureItemWithCategory[]>('/features')
      .then((res) => {
        if (res.data) setFeatures(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading features...</p>
      </main>
    );
  }

  if (features.length === 0) {
    return (
      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Feature Library</h1>
        <p className="text-muted-foreground">No feature items yet.</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Feature Library</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 font-medium">Category</th>
              <th className="py-2 pr-4 font-medium text-right">Cost</th>
              <th className="py-2 pr-4 font-medium text-right">Price</th>
              <th className="py-2 pr-4 font-medium text-right">Margin</th>
              <th className="py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {features.map((f) => {
              const margin =
                f.marginPercent ?? calculateMargin(Number(f.price), Number(f.cost));
              return (
                <tr key={f.id} className="border-b hover:bg-muted/50">
                  <td className="py-2 pr-4 font-medium">{f.name}</td>
                  <td className="py-2 pr-4 text-muted-foreground">
                    {f.category?.name ?? '—'}
                  </td>
                  <td className="py-2 pr-4 text-right">${Number(f.cost).toFixed(2)}</td>
                  <td className="py-2 pr-4 text-right">${Number(f.price).toFixed(2)}</td>
                  <td className="py-2 pr-4 text-right">{margin.toFixed(1)}%</td>
                  <td className="py-2">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        f.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {f.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
