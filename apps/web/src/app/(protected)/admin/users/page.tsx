'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api';
import type { User, CreateUserDto, UpdateUserDto } from '@featureboard/shared';
import { UserRole } from '@featureboard/shared';

type UserFormData = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

const EMPTY_FORM: UserFormData = { name: '', email: '', password: '', role: UserRole.SERVER };
const ROLES = [UserRole.SERVER, UserRole.CHEF, UserRole.MANAGER, UserRole.ADMIN];

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<UserFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  async function loadUsers() {
    try {
      const res = await apiFetch<User[]>('/users');
      setUsers(res.data ?? []);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowForm(true);
  }

  function openEdit(u: User) {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
    setError('');
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editing) {
        const dto: UpdateUserDto = { name: form.name, role: form.role };
        await apiFetch(`/users/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dto),
        });
      } else {
        if (!form.password) {
          setError('Password is required for new users');
          setSaving(false);
          return;
        }
        const dto: CreateUserDto = {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        };
        await apiFetch('/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dto),
        });
      }
      setShowForm(false);
      await loadUsers();
    } catch {
      setError(editing ? 'Failed to update user' : 'Failed to create user');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(u: User) {
    try {
      await apiFetch(`/users/${u.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !u.active } satisfies UpdateUserDto),
      });
      await loadUsers();
    } catch {
      setError('Failed to update user status');
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiFetch(`/users/${id}`, { method: 'DELETE' });
      setConfirmDelete(null);
      await loadUsers();
    } catch {
      setError('Failed to delete user');
    }
  }

  if (!isAdmin) {
    return (
      <div className="p-8">
        <p className="text-destructive">Access denied. Admin role required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90"
        >
          + Add User
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded text-sm">{error}</div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form
            onSubmit={handleSubmit}
            className="bg-background border rounded-lg p-6 w-full max-w-md shadow-lg space-y-4"
          >
            <h2 className="text-lg font-semibold">{editing ? 'Edit User' : 'Create User'}</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                required
                disabled={!!editing}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm disabled:opacity-50"
              />
            </div>

            {!editing && (
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50"
              >
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-background border rounded-lg p-6 w-full max-w-sm shadow-lg">
            <p className="mb-4">Are you sure you want to delete this user?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-md hover:opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Role</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-0.5 bg-muted rounded text-xs font-medium uppercase">
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(u)}
                    disabled={u.id === currentUser?.id}
                    className={`text-xs font-medium px-2 py-0.5 rounded ${
                      u.active
                        ? 'bg-green-500/15 text-green-500'
                        : 'bg-red-500/15 text-red-500'
                    } ${u.id === currentUser?.id ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:opacity-80'}`}
                    title={u.id === currentUser?.id ? 'Cannot deactivate yourself' : 'Toggle active status'}
                  >
                    {u.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEdit(u)}
                      className="text-xs px-2 py-1 border rounded hover:bg-muted"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete(u.id)}
                      disabled={u.id === currentUser?.id}
                      className="text-xs px-2 py-1 border rounded text-destructive hover:bg-destructive/10 disabled:opacity-40 disabled:cursor-not-allowed"
                      title={u.id === currentUser?.id ? 'Cannot delete yourself' : ''}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
