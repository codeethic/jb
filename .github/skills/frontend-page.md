# Skill: Create a New Frontend Page or Component

Scaffold Next.js App Router pages and React components for the FeatureBoard web app following project conventions.

## When to Use

Use when the user asks to add a new page, dashboard section, or reusable component to the frontend.

## Project Conventions

- **App Router**: Pages at `apps/web/src/app/{route}/page.tsx`
- **Styling**: TailwindCSS utility classes + shadcn/ui semantic tokens (`bg-background`, `text-muted-foreground`, `bg-primary`, `text-primary-foreground`, `text-destructive`, `bg-card`, `border-input`)
- **Components**: Colocate in `apps/web/src/components/{domain}/`
- **Server Components** by default; add `'use client'` only when interactivity is needed (state, effects, event handlers)
- **Types**: Import from `@featureboard/shared` using `import type`
- **API calls**: Use `apiFetch<T>` from `@/lib/api` — returns `ApiResponse<T>`

## Page Template — Client Component (Interactive)

```tsx
'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { DomainType } from '@featureboard/shared';

export default function DomainPage() {
  const [items, setItems] = useState<DomainType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<DomainType[]>('/api-route')
      .then((res) => {
        if (res.data) setItems(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <p className="text-muted-foreground">No items found.</p>
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center">Page Title</h1>
      {items.map((item) => (
        <div key={item.id} className="rounded-lg border p-4 space-y-2">
          <h2 className="text-lg font-semibold">{item.name}</h2>
          {/* ... fields */}
        </div>
      ))}
    </main>
  );
}
```

## Page Template — Server Component (Static/Data Display)

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Title — FeatureBoard',
};

export default function DomainPage() {
  return (
    <main className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Page Title</h1>
      {/* ... content */}
    </main>
  );
}
```

## Form Pattern

```tsx
'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { CreateDomainDto } from '@featureboard/shared';

export default function CreateDomainForm() {
  const [fieldName, setFieldName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await apiFetch<unknown>('/api-route', {
        method: 'POST',
        body: JSON.stringify({ fieldName } satisfies CreateDomainDto),
      });

      if (res.error) {
        setError(res.error);
        return;
      }

      // Success: redirect or reset form
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="fieldName" className="text-sm font-medium">
          Field Label
        </label>
        <input
          id="fieldName"
          type="text"
          value={fieldName}
          onChange={(e) => setFieldName(e.target.value)}
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

## Checklist

- [ ] Mobile-first layout (`max-w-lg mx-auto` for lineup views)
- [ ] Loading, empty, and error states handled
- [ ] `import type` for shared types
- [ ] `satisfies` operator used for type-safe DTO construction
- [ ] JWT token handled automatically by `apiFetch`
- [ ] No raw HTML for form controls when shadcn/ui equivalents exist
- [ ] Allergen warnings use `text-destructive` class
- [ ] Card-like items use `rounded-lg border p-4 space-y-2`
