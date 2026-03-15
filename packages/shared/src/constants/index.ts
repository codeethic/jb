export const DEFAULT_CATEGORIES = [
  'Appetizer',
  'Soup',
  'Salad',
  'Steak',
  'Seafood',
  'Entrée',
  'Dessert',
  'Wine',
] as const;

export type DefaultCategory = (typeof DEFAULT_CATEGORIES)[number];
