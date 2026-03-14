import type { FeatureStatus, MealPeriod } from '../enums';
export interface ScheduledFeature {
    id: string;
    featureItemId: string;
    serviceDate: string;
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
export interface UpdateScheduledFeatureDto extends Partial<CreateScheduledFeatureDto> {
}
//# sourceMappingURL=scheduled-feature.d.ts.map