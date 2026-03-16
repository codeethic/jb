import type { MealPeriod } from '@featureboard/shared';
import type { ScheduledFeatureEntity } from './scheduled-feature.entity';

export interface IScheduledFeatureRepository {
  findById(id: string): Promise<ScheduledFeatureEntity | null>;
  findByDate(restaurantId: string, date: string): Promise<ScheduledFeatureEntity[]>;
  findByDateRange(
    restaurantId: string,
    startDate: string,
    endDate: string,
  ): Promise<ScheduledFeatureEntity[]>;
  findByDateAndPeriod(
    restaurantId: string,
    date: string,
    mealPeriod: MealPeriod,
  ): Promise<ScheduledFeatureEntity[]>;
  create(item: Partial<ScheduledFeatureEntity>): Promise<ScheduledFeatureEntity>;
  update(
    id: string,
    data: Partial<ScheduledFeatureEntity>,
  ): Promise<ScheduledFeatureEntity | null>;
  delete(id: string): Promise<void>;
  getLastUsedDates(
    restaurantId: string,
  ): Promise<{ featureItemId: string; lastServiceDate: string }[]>;
  updateSortOrders(items: { id: string; sortOrder: number }[]): Promise<void>;
}

export const SCHEDULED_FEATURE_REPOSITORY = Symbol('SCHEDULED_FEATURE_REPOSITORY');
