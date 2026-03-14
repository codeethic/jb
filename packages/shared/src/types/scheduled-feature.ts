import type { FeatureStatus, MealPeriod } from '../enums';

export interface ScheduledFeature {
  id: string;
  featureItemId: string;
  serviceDate: string; // ISO 8601 YYYY-MM-DD
  mealPeriod: MealPeriod;
  status: FeatureStatus;
  notes?: string;
  sortOrder: number;
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduledFeatureDto {
  featureItemId: string;
  serviceDate: string;
  mealPeriod: MealPeriod;
  status?: FeatureStatus;
  notes?: string;
  sortOrder?: number;
}

export interface UpdateScheduledFeatureDto extends Partial<CreateScheduledFeatureDto> {}
