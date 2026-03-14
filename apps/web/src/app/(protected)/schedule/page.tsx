'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import type { ScheduledFeature, FeatureItem, FeatureCategory } from '@featureboard/shared';
import { FeatureStatus, MealPeriod } from '@featureboard/shared';

interface ScheduleItem extends ScheduledFeature {
  featureItem: FeatureItem & { category: FeatureCategory };
}

function getWeekRange(offset: number) {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7) + offset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { startDate: fmt(monday), endDate: fmt(sunday), monday };
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const STATUS_STYLES: Record<string, string> = {
  [FeatureStatus.DRAFT]: 'bg-yellow-100 text-yellow-800',
  [FeatureStatus.PUBLISHED]: 'bg-green-100 text-green-800',
  [FeatureStatus.EIGHTY_SIXED]: 'bg-red-100 text-red-800',
};

export default function SchedulePage() {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  const { startDate, endDate, monday } = getWeekRange(weekOffset);

  const fetchSchedule = useCallback(() => {
    setLoading(true);
    apiFetch<ScheduleItem[]>(`/schedule?startDate=${startDate}&endDate=${endDate}`)
      .then((res) => {
        if (res.data) setItems(res.data);
      })
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  // Group items by day-of-week index (0=Mon..6=Sun)
  const byDay: Record<number, ScheduleItem[]> = {};
  for (const item of items) {
    const d = new Date(item.serviceDate + 'T00:00:00');
    const idx = (d.getDay() + 6) % 7; // shift so Mon=0
    (byDay[idx] ??= []).push(item);
  }

  return (
    <main className="max-w-6xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Weekly Schedule</h1>
        <div className="flex items-center gap-2 text-sm">
          <button
            className="rounded border px-3 py-1 hover:bg-muted"
            onClick={() => setWeekOffset((w) => w - 1)}
          >
            ← Prev
          </button>
          <span className="font-medium">
            {startDate} – {endDate}
          </span>
          <button
            className="rounded border px-3 py-1 hover:bg-muted"
            onClick={() => setWeekOffset((w) => w + 1)}
          >
            Next →
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading schedule...</p>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((day, i) => {
            const dateObj = new Date(monday);
            dateObj.setDate(monday.getDate() + i);
            const dateStr = dateObj.toISOString().slice(5, 10); // MM-DD

            const dayItems = byDay[i] ?? [];

            return (
              <div key={day} className="rounded-lg border p-2 min-h-[160px]">
                <div className="text-xs font-semibold text-center mb-2">
                  {day}{' '}
                  <span className="text-muted-foreground font-normal">{dateStr}</span>
                </div>

                {dayItems.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center mt-4">—</p>
                )}

                <div className="space-y-1">
                  {dayItems.map((si) => (
                    <div
                      key={si.id}
                      className="rounded border px-2 py-1 text-xs space-y-0.5"
                    >
                      <div className="font-medium truncate">
                        {si.featureItem?.name ?? si.featureItemId.slice(0, 8)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{si.mealPeriod}</span>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${STATUS_STYLES[si.status] ?? ''}`}
                        >
                          {si.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
