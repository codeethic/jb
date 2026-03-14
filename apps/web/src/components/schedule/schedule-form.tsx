'use client';

import { useState } from 'react';
import type { FeatureItem, FeatureCategory, CreateScheduledFeatureDto } from '@featureboard/shared';
import { MealPeriod, FeatureStatus } from '@featureboard/shared';

interface FeatureOption extends FeatureItem {
  category?: FeatureCategory;
}

interface ScheduleFormProps {
  features: FeatureOption[];
  defaultDate: string;
  onSubmit: (dto: CreateScheduledFeatureDto) => Promise<void>;
  onCancel: () => void;
}

export default function ScheduleForm({
  features,
  defaultDate,
  onSubmit,
  onCancel,
}: ScheduleFormProps) {
  const [featureItemId, setFeatureItemId] = useState('');
  const [serviceDate, setServiceDate] = useState(defaultDate);
  const [mealPeriod, setMealPeriod] = useState<MealPeriod>(MealPeriod.DINNER);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSubmit({
        featureItemId,
        serviceDate,
        mealPeriod,
        status: FeatureStatus.DRAFT,
        ...(notes.trim() && { notes: notes.trim() }),
      });
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm';

  // group features by category
  const byCategory: Record<string, FeatureOption[]> = {};
  for (const f of features) {
    const cat = f.category?.name ?? 'Other';
    (byCategory[cat] ??= []).push(f);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm font-medium">Feature Item *</label>
        <select
          className={inputCls}
          value={featureItemId}
          onChange={(e) => setFeatureItemId(e.target.value)}
          required
        >
          <option value="">Select a feature</option>
          {Object.entries(byCategory).map(([cat, items]) => (
            <optgroup key={cat} label={cat}>
              {items.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Date *</label>
          <input
            type="date"
            className={inputCls}
            value={serviceDate}
            onChange={(e) => setServiceDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Meal Period *</label>
          <select
            className={inputCls}
            value={mealPeriod}
            onChange={(e) => setMealPeriod(e.target.value as MealPeriod)}
          >
            <option value={MealPeriod.LUNCH}>Lunch</option>
            <option value={MealPeriod.DINNER}>Dinner</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Notes</label>
        <textarea
          className={`${inputCls} h-16 resize-none`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Chef notes for this service..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm rounded-md border hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? 'Adding...' : 'Add to Schedule'}
        </button>
      </div>
    </form>
  );
}
