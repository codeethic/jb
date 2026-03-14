export interface FeatureItem {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  ingredients?: string;
  allergens?: string;
  prepNotes?: string;
  platingNotes?: string;
  cost: number;
  price: number;
  imageUrl?: string;
  tags: string[];
  active: boolean;
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeatureItemDto {
  name: string;
  categoryId: string;
  description: string;
  ingredients?: string;
  allergens?: string;
  prepNotes?: string;
  platingNotes?: string;
  cost: number;
  price: number;
  imageUrl?: string;
  tags?: string[];
}

export interface UpdateFeatureItemDto extends Partial<CreateFeatureItemDto> {}

/** Computed: (price - cost) / price */
export function calculateMargin(price: number, cost: number): number {
  if (price <= 0) return 0;
  return ((price - cost) / price) * 100;
}
