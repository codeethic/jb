'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth, hasRole } from '@/lib/auth-context';
import type { FeatureItem, FeatureCategory, CreateFeatureItemDto } from '@featureboard/shared';
import { calculateMargin, UserRole } from '@featureboard/shared';
import FeatureForm from '@/components/features/feature-form';

interface FeatureItemWithCategory extends FeatureItem {
  category?: FeatureCategory;
  marginPercent?: number;
}

interface LastUsedEntry {
  featureItemId: string;
  lastServiceDate: string;
}

type ViewMode = 'list' | 'create' | 'edit';

function formatLastUsed(dateStr: string): string {
  const raw = typeof dateStr === 'string' ? dateStr.slice(0, 10) : String(dateStr).slice(0, 10);
  const last = new Date(raw + 'T00:00:00');
  if (isNaN(last.getTime())) return 'Unknown';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = today.getTime() - last.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return `in ${-diffDays}d`;
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}

export default function FeaturesPage() {
  const { user } = useAuth();
  const [features, setFeatures] = useState<FeatureItemWithCategory[]>([]);
  const [categories, setCategories] = useState<FeatureCategory[]>([]);
  const [lastUsedMap, setLastUsedMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<ViewMode>('list');
  const [editingFeature, setEditingFeature] = useState<FeatureItemWithCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FeatureItemWithCategory | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortCol, setSortCol] = useState<'name' | 'category' | 'cost' | 'price' | 'margin' | 'status' | 'lastUsed'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const canCreate = user ? hasRole(user.role, UserRole.CHEF) : false;
  const canDelete = user ? hasRole(user.role, UserRole.MANAGER) : false;

  const fetchFeatures = useCallback(() => {
    setLoading(true);
    Promise.all([
      apiFetch<FeatureItemWithCategory[]>('/features'),
      apiFetch<LastUsedEntry[]>('/schedule/last-used'),
    ])
      .then(([featRes, luRes]) => {
        if (featRes.data) setFeatures(featRes.data);
        if (luRes.data) {
          const map: Record<string, string> = {};
          for (const entry of luRes.data) {
            map[entry.featureItemId] = entry.lastServiceDate;
          }
          setLastUsedMap(map);
        }
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

  const searchLower = search.toLowerCase();
  const filtered = features.filter((f) => {
    if (search && !f.name.toLowerCase().includes(searchLower) && !f.description?.toLowerCase().includes(searchLower)) {
      return false;
    }
    if (categoryFilter && f.categoryId !== categoryFilter) return false;
    if (statusFilter === 'active' && !f.active) return false;
    if (statusFilter === 'inactive' && f.active) return false;
    return true;
  });

  const toggleSort = (col: typeof sortCol) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortCol) {
      case 'name':
        return dir * a.name.localeCompare(b.name);
      case 'category':
        return dir * (a.category?.name ?? '').localeCompare(b.category?.name ?? '');
      case 'cost':
        return dir * (Number(a.cost) - Number(b.cost));
      case 'price':
        return dir * (Number(a.price) - Number(b.price));
      case 'margin': {
        const am = a.marginPercent ?? calculateMargin(Number(a.price), Number(a.cost));
        const bm = b.marginPercent ?? calculateMargin(Number(b.price), Number(b.cost));
        return dir * (am - bm);
      }
      case 'status':
        return dir * (Number(a.active) - Number(b.active));
      case 'lastUsed': {
        const da = lastUsedMap[a.id] ?? '';
        const db = lastUsedMap[b.id] ?? '';
        return dir * da.localeCompare(db);
      }
      default:
        return 0;
    }
  });

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

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or description…"
          className="flex-1 min-w-[200px] rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border bg-background px-3 py-1.5 text-sm outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          className="rounded-md border bg-background px-3 py-1.5 text-sm outline-none"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {(search || categoryFilter || statusFilter !== 'all') && (
          <button
            onClick={() => { setSearch(''); setCategoryFilter(''); setStatusFilter('all'); }}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Clear filters
          </button>
        )}
        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} of {features.length} items
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">
          {features.length === 0 ? 'No feature items yet.' : 'No items match the current filters.'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-left">
                {[
                  { key: 'name' as const, label: 'Name' },
                  { key: 'category' as const, label: 'Category' },
                  { key: 'cost' as const, label: 'Cost', right: true },
                  { key: 'price' as const, label: 'Price', right: true },
                  { key: 'margin' as const, label: 'Margin', right: true },
                  { key: 'status' as const, label: 'Status' },
                  { key: 'lastUsed' as const, label: 'Last Used' },
                ].map(({ key, label, right }) => (
                  <th
                    key={key}
                    onClick={() => toggleSort(key)}
                    className={`py-2 pr-4 font-medium cursor-pointer select-none hover:text-foreground ${right ? 'text-right' : ''}`}
                  >
                    {label}{' '}
                    <span className="inline-block w-4 text-muted-foreground">
                      {sortCol === key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                    </span>
                  </th>
                ))}
                {canCreate && <th className="py-2 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {sorted.map((f) => {
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
                            ? 'bg-green-500/15 text-green-500'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {f.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground text-xs">
                      {lastUsedMap[f.id]
                        ? formatLastUsed(lastUsedMap[f.id])
                        : 'Never'}
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
