'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth, hasRole } from '@/lib/auth-context';
import type {
  ScheduledFeature,
  FeatureItem,
  FeatureCategory,
  CreateScheduledFeatureDto,
} from '@featureboard/shared';
import { FeatureStatus, MealPeriod, UserRole } from '@featureboard/shared';
import ScheduleForm from '@/components/schedule/schedule-form';

interface FeatureOption extends FeatureItem {
  category?: FeatureCategory;
}

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

function dateForDayIndex(monday: Date, i: number) {
  const d = new Date(monday);
  d.setDate(monday.getDate() + i);
  return d.toISOString().slice(0, 10);
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const STATUS_STYLES: Record<string, string> = {
  [FeatureStatus.DRAFT]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [FeatureStatus.PUBLISHED]: 'bg-green-100 text-green-800 border-green-200',
  [FeatureStatus.EIGHTY_SIXED]: 'bg-red-100 text-red-800 border-red-200',
};

const STATUS_CYCLE: FeatureStatus[] = [
  FeatureStatus.DRAFT,
  FeatureStatus.PUBLISHED,
  FeatureStatus.EIGHTY_SIXED,
];

export default function SchedulePage() {
  const { user } = useAuth();
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [features, setFeatures] = useState<FeatureOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [addingForDay, setAddingForDay] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ScheduleItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  const canEdit = user ? hasRole(user.role, UserRole.CHEF) : false;
  const canDelete = user ? hasRole(user.role, UserRole.MANAGER) : false;

  const { startDate, endDate, monday } = getWeekRange(weekOffset);

  // Drag state
  const dragId = useRef<string | null>(null);

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

  useEffect(() => {
    if (canEdit) {
      apiFetch<FeatureOption[]>('/features').then((res) => {
        if (res.data) setFeatures(res.data);
      });
    }
  }, [canEdit]);

  // Group items by day-of-week index (0=Mon..6=Sun), sorted by sortOrder
  const byDay: Record<number, ScheduleItem[]> = {};
  for (const item of items) {
    const d = new Date(item.serviceDate + 'T00:00:00');
    const idx = (d.getDay() + 6) % 7;
    (byDay[idx] ??= []).push(item);
  }
  for (const arr of Object.values(byDay)) {
    arr.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  const handleAdd = async (dto: CreateScheduledFeatureDto) => {
    const dayIdx = addingForDay!;
    const dayItems = byDay[dayIdx] ?? [];
    const res = await apiFetch<ScheduleItem>('/schedule', {
      method: 'POST',
      body: JSON.stringify({
        ...dto,
        sortOrder: dayItems.length,
      }),
    });
    if (res.error) throw new Error(res.error);
    setAddingForDay(null);
    fetchSchedule();
  };

  const cycleStatus = async (item: ScheduleItem) => {
    const idx = STATUS_CYCLE.indexOf(item.status);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    await apiFetch(`/schedule/${item.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: next }),
    });
    fetchSchedule();
  };

  const saveNotes = async () => {
    if (!editingItem) return;
    await apiFetch(`/schedule/${editingItem.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ notes: editNotes.trim() || null }),
    });
    setEditingItem(null);
    fetchSchedule();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await apiFetch(`/schedule/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleteTarget(null);
    setDeleting(false);
    fetchSchedule();
  };

  // Drag-and-drop handlers
  const onDragStart = (id: string) => {
    dragId.current = id;
  };

  const onDrop = async (targetDate: string) => {
    const id = dragId.current;
    dragId.current = null;
    if (!id) return;
    const draggedItem = items.find((i) => i.id === id);
    if (!draggedItem || draggedItem.serviceDate === targetDate) return;
    await apiFetch(`/schedule/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ serviceDate: targetDate }),
    });
    fetchSchedule();
  };

  // Duplicate previous week
  const duplicateWeek = async () => {
    const prev = getWeekRange(weekOffset - 1);
    setDuplicating(true);
    const res = await apiFetch<ScheduleItem[]>(
      `/schedule?startDate=${prev.startDate}&endDate=${prev.endDate}`,
    );
    if (res.data && res.data.length > 0) {
      const promises = res.data.map((item) => {
        const oldD = new Date(item.serviceDate + 'T00:00:00');
        const newD = new Date(oldD);
        newD.setDate(oldD.getDate() + 7);
        const dto: CreateScheduledFeatureDto = {
          featureItemId: item.featureItemId,
          serviceDate: newD.toISOString().slice(0, 10),
          mealPeriod: item.mealPeriod,
          status: FeatureStatus.DRAFT,
          notes: item.notes,
          sortOrder: item.sortOrder,
        };
        return apiFetch('/schedule', {
          method: 'POST',
          body: JSON.stringify(dto),
        });
      });
      await Promise.all(promises);
    }
    setDuplicating(false);
    fetchSchedule();
  };

  // Add form overlay
  if (addingForDay !== null) {
    const dateStr = dateForDayIndex(monday, addingForDay);
    return (
      <div className="max-w-lg mx-auto p-8">
        <h1 className="text-2xl font-bold mb-2">Add to Schedule</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {DAYS[addingForDay]} — {dateStr}
        </p>
        <ScheduleForm
          features={features}
          defaultDate={dateStr}
          onSubmit={handleAdd}
          onCancel={() => setAddingForDay(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Weekly Schedule</h1>
        <div className="flex items-center gap-2 text-sm">
          {canEdit && (
            <button
              onClick={duplicateWeek}
              disabled={duplicating}
              className="rounded border px-3 py-1 hover:bg-muted disabled:opacity-50"
              title="Copy last week's schedule into this week as drafts"
            >
              {duplicating ? 'Copying...' : 'Duplicate Prev Week'}
            </button>
          )}
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
            const dateStr = dateForDayIndex(monday, i);
            const displayDate = dateStr.slice(5);
            const dayItems = byDay[i] ?? [];

            return (
              <div
                key={day}
                className="rounded-lg border p-2 min-h-[180px] flex flex-col"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(dateStr)}
              >
                <div className="text-xs font-semibold text-center mb-2">
                  {day}{' '}
                  <span className="text-muted-foreground font-normal">{displayDate}</span>
                </div>

                <div className="space-y-1 flex-1">
                  {dayItems.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center mt-4">—</p>
                  )}
                  {dayItems.map((si) => (
                    <div
                      key={si.id}
                      draggable={canEdit}
                      onDragStart={() => onDragStart(si.id)}
                      className={`rounded border px-2 py-1 text-xs space-y-0.5 ${
                        canEdit ? 'cursor-grab active:cursor-grabbing' : ''
                      }`}
                    >
                      <div className="font-medium truncate">
                        {si.featureItem?.name ?? si.featureItemId.slice(0, 8)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{si.mealPeriod}</span>
                        {canEdit ? (
                          <button
                            onClick={() => cycleStatus(si)}
                            className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium border ${STATUS_STYLES[si.status] ?? ''}`}
                            title="Click to cycle status"
                          >
                            {si.status}
                          </button>
                        ) : (
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${STATUS_STYLES[si.status] ?? ''}`}
                          >
                            {si.status}
                          </span>
                        )}
                      </div>
                      {canEdit && (
                        <div className="flex gap-1 pt-0.5">
                          <button
                            onClick={() => {
                              setEditingItem(si);
                              setEditNotes(si.notes ?? '');
                            }}
                            className="text-[10px] text-muted-foreground hover:text-foreground"
                          >
                            notes
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => setDeleteTarget(si)}
                              className="text-[10px] text-destructive hover:text-destructive/80"
                            >
                              remove
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {canEdit && (
                  <button
                    onClick={() => setAddingForDay(i)}
                    className="mt-2 w-full text-xs text-center py-1 rounded border border-dashed hover:bg-muted text-muted-foreground"
                  >
                    + Add
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit notes modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg border shadow-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-semibold mb-1">Edit Notes</h2>
            <p className="text-xs text-muted-foreground mb-3">
              {editingItem.featureItem?.name} — {editingItem.serviceDate}
            </p>
            <textarea
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-24 resize-none"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Chef notes..."
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-sm rounded-md border hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={saveNotes}
                className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground shadow hover:bg-primary/90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg border shadow-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-semibold mb-2">Remove from Schedule</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Remove <strong>{deleteTarget.featureItem?.name}</strong> from{' '}
              {deleteTarget.serviceDate}?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm rounded-md border hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm rounded-md bg-destructive text-destructive-foreground shadow hover:bg-destructive/90 disabled:opacity-50"
              >
                {deleting ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
