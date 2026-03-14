'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth, hasRole } from '@/lib/auth-context';
import type { FeatureItem, FeatureCategory, CreateFeatureItemDto } from '@featureboard/shared';
import { calculateMargin, UserRole } from '@featureboard/shared';
import FeatureForm from '@/components/features/feature-form';

interface FeatureItemWithCategory extends FeatureItem {
  category?: FeatureCategory;
  marginPercent?: number;
}

type ViewMode = 'list' | 'create' | 'edit';

export default function FeaturesPage() {
  const { user } = useAuth();
  const [features, setFeatures] = useState<FeatureItemWithCategory[]>([]);
  const [categories, setCategories] = useState<FeatureCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<ViewMode>('list');
  const [editingFeature, setEditingFeature] = useState<FeatureItemWithCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FeatureItemWithCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canCreate = user ? hasRole(user.role, UserRole.CHEF) : false;
  const canDelete = user ? hasRole(user.role, UserRole.MANAGER) : false;

  const fetchFeatures = useCallback(() => {
    setLoading(true);
    apiFetch<FeatureItemWithCategory[]>('/features')
      .then((res) => {
        if (res.data) setFeatures(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchFeatures();
    apiFetch<FeatureCategory[]>('/categories').then((res) => {
      if (res.data) setCategories(res.data);
    });
  }, [fetchFeatures]);

  const handleCreate = async (dto: CreateFeatureItemDto) => {
    const res = await apiFetch<FeatureItemWithCategory>('/features', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    if (res.error) throw new Error(res.error);
    setMode('list');
    fetchFeatures();
  };

  const handleEdit = async (dto: CreateFeatureItemDto) => {
    if (!editingFeature) return;
    const res = await apiFetch<FeatureItemWithCategory>(`/features/${editingFeature.id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
    if (res.error) throw new Error(res.error);
    setMode('list');
    setEditingFeature(null);
    fetchFeatures();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await apiFetch(`/features/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleteTarget(null);
    setDeleting(false);
    fetchFeatures();
  };

  if (mode === 'create') {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">New Feature Item</h1>
        <FeatureForm
          categories={categories}
          onSubmit={handleCreate}
          onCancel={() => setMode('list')}
          submitLabel="Create Feature"
        />
      </div>
    );
  }

  if (mode === 'edit' && editingFeature) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Edit Feature Item</h1>
        <FeatureForm
          categories={categories}
          initial={{
            name: editingFeature.name,
            categoryId: editingFeature.categoryId,
            description: editingFeature.description,
            ingredients: editingFeature.ingredients ?? undefined,
            allergens: editingFeature.allergens ?? undefined,
            prepNotes: editingFeature.prepNotes ?? undefined,
            platingNotes: editingFeature.platingNotes ?? undefined,
            cost: editingFeature.cost,
            price: editingFeature.price,
            tags: editingFeature.tags,
          }}
          onSubmit={handleEdit}
          onCancel={() => {
            setMode('list');
            setEditingFeature(null);
          }}
          submitLabel="Update Feature"
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading features...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Feature Library</h1>
        {canCreate && (
          <button
            onClick={() => setMode('create')}
            className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground shadow hover:bg-primary/90"
          >
            + New Feature
          </button>
        )}
      </div>

      {features.length === 0 ? (
        <p className="text-muted-foreground">No feature items yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 font-medium">Category</th>
                <th className="py-2 pr-4 font-medium text-right">Cost</th>
                <th className="py-2 pr-4 font-medium text-right">Price</th>
                <th className="py-2 pr-4 font-medium text-right">Margin</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                {canCreate && <th className="py-2 font-medium text-right">Actions</th>}
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
                    <td className="py-2 pr-4">
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
                    {canCreate && (
                      <td className="py-2 text-right space-x-1">
                        <button
                          onClick={() => {
                            setEditingFeature(f);
                            setMode('edit');
                          }}
                          className="px-2 py-1 text-xs rounded border hover:bg-muted"
                        >
                          Edit
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => setDeleteTarget(f)}
                            className="px-2 py-1 text-xs rounded border text-destructive hover:bg-destructive/10"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg border shadow-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-semibold mb-2">Delete Feature</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This
              action cannot be undone.
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
