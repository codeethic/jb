'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Theme = 'classic' | 'bistro' | 'ocean' | 'vineyard';

const THEMES: { value: Theme; label: string }[] = [
  { value: 'classic', label: 'Classic' },
  { value: 'bistro', label: 'Bistro' },
  { value: 'ocean', label: 'Ocean' },
  { value: 'vineyard', label: 'Vineyard' },
];

const STORAGE_KEY = 'featureboard-theme';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  themes: typeof THEMES;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('classic');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'classic' || stored === 'bistro' || stored === 'ocean' || stored === 'vineyard') {
      setThemeState(stored);
      document.documentElement.setAttribute('data-theme', stored);
    }
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
    document.documentElement.setAttribute('data-theme', t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
