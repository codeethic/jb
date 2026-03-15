'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { calculateMargin } from '@featureboard/shared';
import type { FeatureCategory, CreateFeatureItemDto } from '@featureboard/shared';

interface FeatureFormProps {
  categories: FeatureCategory[];
  initial?: Partial<CreateFeatureItemDto>;
  onSubmit: (data: CreateFeatureItemDto) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export default function FeatureForm({
  categories,
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}: FeatureFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [ingredients, setIngredients] = useState(initial?.ingredients ?? '');
  const [allergens, setAllergens] = useState(initial?.allergens ?? '');
  const [prepNotes, setPrepNotes] = useState(initial?.prepNotes ?? '');
  const [platingNotes, setPlatingNotes] = useState(initial?.platingNotes ?? '');
  const [cost, setCost] = useState(initial?.cost?.toString() ?? '');
  const [price, setPrice] = useState(initial?.price?.toString() ?? '');
  const [tags, setTags] = useState(initial?.tags?.join(', ') ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const costNum = parseFloat(cost) || 0;
  const priceNum = parseFloat(price) || 0;
  const margin = calculateMargin(priceNum, costNum);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const dto: CreateFeatureItemDto = {
        name: name.trim(),
        categoryId,
        description: description.trim(),
        cost: costNum,
        price: priceNum,
        ...(ingredients.trim() && { ingredients: ingredients.trim() }),
        ...(allergens.trim() && { allergens: allergens.trim() }),
        ...(prepNotes.trim() && { prepNotes: prepNotes.trim() }),
        ...(platingNotes.trim() && { platingNotes: platingNotes.trim() }),
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };
      await onSubmit(dto);
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm';
  const labelCls = 'text-sm font-medium';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-1">
          <label className={labelCls}>Name *</label>
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Coffee-Cured Filet Mignon"
          />
        </div>

        {/* Category */}
        <div className="space-y-1">
          <label className={labelCls}>Category *</label>
          <select
            className={inputCls}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className={labelCls}>Description *</label>
        <textarea
          className={`${inputCls} h-20 resize-none`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="Pan-seared halibut with beurre blanc"
        />
      </div>

      {/* Ingredients */}
      <div className="space-y-1">
        <label className={labelCls}>Ingredients</label>
        <textarea
          className={`${inputCls} h-16 resize-none`}
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="Halibut, butter, white wine, shallots..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Allergens */}
        <div className="space-y-1">
          <label className={labelCls}>Allergens</label>
          <input
            className={inputCls}
            value={allergens}
            onChange={(e) => setAllergens(e.target.value)}
            placeholder="Fish, Dairy"
          />
        </div>

        {/* Tags */}
        <div className="space-y-1">
          <label className={labelCls}>Tags</label>
          <input
            className={inputCls}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="seafood, seasonal"
          />
        </div>
      </div>

      {/* Cost / Price / Margin */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className={labelCls}>Cost ($) *</label>
          <input
            className={inputCls}
            type="number"
            step="0.01"
            min="0"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            required
            placeholder="0.00"
          />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>Price ($) *</label>
          <input
            className={inputCls}
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            placeholder="0.00"
          />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>Margin</label>
          <div
            className={`flex h-9 items-center rounded-md border px-3 text-sm ${
              margin >= 60
                ? 'bg-green-50 text-green-700 border-green-200'
                : margin >= 40
                  ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {priceNum > 0 ? `${margin.toFixed(1)}%` : '—'}
          </div>
        </div>
      </div>

      {/* Prep Notes / Plating Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className={labelCls}>Prep Notes</label>
          <textarea
            className={`${inputCls} h-16 resize-none`}
            value={prepNotes}
            onChange={(e) => setPrepNotes(e.target.value)}
            placeholder="Brine for 2 hours..."
          />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>Plating Notes</label>
          <textarea
            className={`${inputCls} h-16 resize-none`}
            value={platingNotes}
            onChange={(e) => setPlatingNotes(e.target.value)}
            placeholder="Serve on warm plate..."
          />
        </div>
      </div>

      {/* Actions */}
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
          {saving ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
