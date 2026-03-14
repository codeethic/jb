'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import type {
  ScheduledFeature,
  FeatureItem,
  FeatureCategory,
  Pairing,
} from '@featureboard/shared';

interface LineupItem extends ScheduledFeature {
  featureItem: FeatureItem & { category: FeatureCategory };
}

interface PairingWithItems extends Pairing {
  foodItem: FeatureItem;
  wineItem: FeatureItem;
}

export default function PrintLineupPage() {
  const [lineup, setLineup] = useState<LineupItem[]>([]);
  const [pairings, setPairings] = useState<PairingWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    Promise.all([
      apiFetch<LineupItem[]>('/today'),
      apiFetch<PairingWithItems[]>('/pairings'),
    ])
      .then(([lineupRes, pairingsRes]) => {
        if (lineupRes.data) setLineup(lineupRes.data);
        if (pairingsRes.data) setPairings(pairingsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  // Group lineup by category
  const byCategory: Record<string, LineupItem[]> = {};
  for (const item of lineup) {
    const cat = item.featureItem.category?.name ?? 'Other';
    (byCategory[cat] ??= []).push(item);
  }

  // Map pairings relevant to today's food items
  const todayFoodIds = new Set(lineup.map((l) => l.featureItemId));
  const relevantPairings = pairings.filter((p) => todayFoodIds.has(p.foodItemId));

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading lineup...</p>
      </div>
    );
  }

  return (
    <>
      {/* Print-only styles */}
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-page { padding: 0 !important; max-width: none !important; }
        }
      `}</style>

      {/* Screen-only action bar */}
      <div className="no-print max-w-2xl mx-auto px-6 pt-6 flex items-center justify-between">
        <a
          href="/today"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to lineup
        </a>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground shadow hover:bg-primary/90"
        >
          Print / Save PDF
        </button>
      </div>

      {/* Printable content */}
      <div className="print-page max-w-2xl mx-auto p-6 space-y-8">
        <header className="text-center border-b pb-4">
          <h1 className="text-3xl font-bold tracking-tight">Tonight&apos;s Features</h1>
          <p className="text-sm text-muted-foreground mt-1">{today}</p>
        </header>

        {lineup.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No features published for today.
          </p>
        ) : (
          <div className="space-y-6">
            {Object.entries(byCategory).map(([category, items]) => (
              <section key={category}>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 border-b pb-1">
                  {category}
                </h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="pl-2">
                      <h3 className="text-lg font-semibold">{item.featureItem.name}</h3>
                      <p className="text-sm mt-0.5">{item.featureItem.description}</p>
                      {item.featureItem.allergens && (
                        <p className="text-xs text-destructive mt-1">
                          Allergens: {item.featureItem.allergens}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-xs italic text-muted-foreground mt-1">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {relevantPairings.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 border-b pb-1">
              Wine Pairings
            </h2>
            <div className="space-y-3">
              {relevantPairings.map((p) => (
                <div key={p.id} className="pl-2">
                  <p className="text-sm">
                    <span className="font-medium">{p.foodItem?.name}</span>
                    {' → '}
                    <span className="font-medium">{p.wineItem?.name}</span>
                  </p>
                  {p.pairingNote && (
                    <p className="text-xs text-muted-foreground mt-0.5 italic">
                      {p.pairingNote}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="text-center text-xs text-muted-foreground border-t pt-4">
          Generated by FeatureBoard
        </footer>
      </div>
    </>
  );
}
