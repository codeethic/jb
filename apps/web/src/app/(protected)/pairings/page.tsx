'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth, hasRole } from '@/lib/auth-context';
import type {
  Pairing,
  FeatureItem,
  FeatureCategory,
  CreatePairingDto,
} from '@featureboard/shared';
import { UserRole } from '@featureboard/shared';

interface PairingWithItems extends Pairing {
  foodItem: FeatureItem & { category?: FeatureCategory };
  wineItem: FeatureItem & { category?: FeatureCategory };
}

interface FeatureOption extends FeatureItem {
  category?: FeatureCategory;
}

type ViewMode = 'list' | 'create' | 'edit';

export default function PairingsPage() {
  const { user } = useAuth();
  const [pairings, setPairings] = useState<PairingWithItems[]>([]);
  const [features, setFeatures] = useState<FeatureOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<ViewMode>('list');
  const [editingPairing, setEditingPairing] = useState<PairingWithItems | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PairingWithItems | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canEdit = user ? hasRole(user.role, UserRole.CHEF) : false;
  const canDelete = user ? hasRole(user.role, UserRole.MANAGER) : false;

  const fetchPairings = useCallback(() => {
    setLoading(true);
    apiFetch<PairingWithItems[]>('/pairings')
      .then((res) => {
        if (res.data) setPairings(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPairings();
    apiFetch<FeatureOption[]>('/features').then((res) => {
      if (res.data) setFeatures(res.data);
    });
  }, [fetchPairings]);

  const foodItems = features.filter(
    (f) => f.category?.name !== 'Wine' && f.active,
  );
  const wineItems = features.filter(
    (f) => f.category?.name === 'Wine' && f.active,
  );

  // Form state
  const [foodItemId, setFoodItemId] = useState('');
  const [wineItemId, setWineItemId] = useState('');
  const [pairingNote, setPairingNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const resetForm = () => {
    setFoodItemId('');
    setWineItemId('');
    setPairingNote('');
    setFormError('');
  };

  const openCreate = () => {
    resetForm();
    setMode('create');
  };

  const openEdit = (p: PairingWithItems) => {
    setEditingPairing(p);
    setFoodItemId(p.foodItemId);
    setWineItemId(p.wineItemId);
    setPairingNote(p.pairingNote ?? '');
    setFormError('');
    setMode('edit');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const dto: CreatePairingDto = {
        foodItemId,
        wineItemId,
        ...(pairingNote.trim() && { pairingNote: pairingNote.trim() }),
      };
      const res = await apiFetch('/pairings', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
      if (res.error) throw new Error(res.error);
      setMode('list');
      resetForm();
      fetchPairings();
    } catch {
      setFormError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPairing) return;
    setSaving(true);
    setFormError('');
    try {
      const res = await apiFetch(`/pairings/${editingPairing.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          foodItemId,
          wineItemId,
          pairingNote: pairingNote.trim() || null,
        }),
      });
      if (res.error) throw new Error(res.error);
      setMode('list');
      setEditingPairing(null);
      resetForm();
      fetchPairings();
    } catch {
      setFormError('Failed to update. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await apiFetch(`/pairings/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleteTarget(null);
    setDeleting(false);
    fetchPairings();
  };

  const inputCls =
    'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm';

  // Form view (create / edit)
  if (mode === 'create' || mode === 'edit') {
    return (
      <div className="max-w-lg mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">
          {mode === 'create' ? 'New Wine Pairing' : 'Edit Wine Pairing'}
        </h1>
        <form
          onSubmit={mode === 'create' ? handleCreate : handleUpdate}
          className="space-y-4"
        >
          {formError && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {formError}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium">Food Item *</label>
            <select
              className={inputCls}
              value={foodItemId}
              onChange={(e) => setFoodItemId(e.target.value)}
              required
            >
              <option value="">Select food feature</option>
              {foodItems.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.category?.name})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Wine *</label>
            <select
              className={inputCls}
              value={wineItemId}
              onChange={(e) => setWineItemId(e.target.value)}
              required
            >
              <option value="">Select wine</option>
              {wineItems.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Pairing Note</label>
            <textarea
              className={`${inputCls} h-20 resize-none`}
              value={pairingNote}
              onChange={(e) => setPairingNote(e.target.value)}
              placeholder="Crisp acidity complements the fish..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setMode('list');
                setEditingPairing(null);
                resetForm();
              }}
              className="px-4 py-2 text-sm rounded-md border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
            >
              {saving
                ? 'Saving...'
                : mode === 'create'
                  ? 'Create Pairing'
                  : 'Update Pairing'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // List view
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading pairings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Wine Pairings</h1>
        {canEdit && (
          <button
            onClick={openCreate}
            className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground shadow hover:bg-primary/90"
          >
            + New Pairing
          </button>
        )}
      </div>

      {pairings.length === 0 ? (
        <p className="text-muted-foreground">No wine pairings yet.</p>
      ) : (
        <div className="space-y-3">
          {pairings.map((p) => (
            <div
              key={p.id}
              className="rounded-lg border p-4 flex items-start justify-between gap-4"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{p.foodItem?.name}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-medium">{p.wineItem?.name}</span>
                </div>
                {p.pairingNote && (
                  <p className="text-sm text-muted-foreground italic">
                    {p.pairingNote}
                  </p>
                )}
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>{p.foodItem?.category?.name}</span>
                </div>
              </div>
              {canEdit && (
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(p)}
                    className="px-2 py-1 text-xs rounded border hover:bg-muted"
                  >
                    Edit
                  </button>
                  {canDelete && (
                    <button
                      onClick={() => setDeleteTarget(p)}
                      className="px-2 py-1 text-xs rounded border text-destructive hover:bg-destructive/10"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg border shadow-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-semibold mb-2">Delete Pairing</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Remove the pairing between{' '}
              <strong>{deleteTarget.foodItem?.name}</strong> and{' '}
              <strong>{deleteTarget.wineItem?.name}</strong>?
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
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
