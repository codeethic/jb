'use client';

import { useState, useMemo } from 'react';
import { HELP_ENTRIES, HELP_CATEGORIES, type HelpEntry } from '@/lib/help-content';

export default function HelpPage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let entries = HELP_ENTRIES;

    if (activeCategory) {
      entries = entries.filter((e) => e.category === activeCategory);
    }

    if (query.trim()) {
      const terms = query.toLowerCase().split(/\s+/);
      entries = entries.filter((entry) => {
        const haystack = [
          entry.title,
          entry.category,
          entry.content,
          ...entry.keywords,
        ]
          .join(' ')
          .toLowerCase();
        return terms.every((term) => haystack.includes(term));
      });
    }

    return entries;
  }, [query, activeCategory]);

  const grouped = useMemo(() => {
    const map = new Map<string, HelpEntry[]>();
    for (const entry of filtered) {
      const list = map.get(entry.category) || [];
      list.push(entry);
      map.set(entry.category, list);
    }
    return map;
  }, [filtered]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">Help</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Search for topics or browse by category.
      </p>

      {/* Search */}
      <div className="relative mb-4">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search help topics..."
          className="w-full rounded-md border bg-background py-2 pl-10 pr-4 text-sm outline-none ring-ring focus:ring-2"
        />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            activeCategory === null
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-accent'
          }`}
        >
          All
        </button>
        {HELP_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">
          No help topics match your search. Try different keywords.
        </p>
      ) : (
        Array.from(grouped.entries()).map(([category, entries]) => (
          <div key={category} className="mb-6">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {category}
            </h2>
            <div className="flex flex-col gap-1">
              {entries.map((entry) => {
                const isOpen = expandedId === entry.id;
                return (
                  <div key={entry.id} className="rounded-md border">
                    <button
                      onClick={() => setExpandedId(isOpen ? null : entry.id)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-muted/50 transition-colors"
                    >
                      {entry.title}
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`flex-shrink-0 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      >
                        <polyline points="4 6 8 10 12 6" />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                        {entry.content.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return (
                              <strong key={i} className="text-foreground font-medium">
                                {part.slice(2, -2)}
                              </strong>
                            );
                          }
                          return <span key={i}>{part}</span>;
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      <p className="text-xs text-muted-foreground text-center mt-8">
        {filtered.length} of {HELP_ENTRIES.length} topics shown
      </p>
    </div>
  );
}
