export interface FeatureCategory {
  id: string;
  name: string;
  sortOrder: number;
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  sortOrder?: number;
}
