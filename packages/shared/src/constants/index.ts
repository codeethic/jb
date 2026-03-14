export const DEFAULT_CATEGORIES = [
  'Appetizer',
  'Soup',
  'Fish',
  'Entrée',
  'Dessert',
  'Wine',
] as const;

export type DefaultCategory = (typeof DEFAULT_CATEGORIES)[number];
