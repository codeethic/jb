import type { FeatureItemEntity } from './feature-item.entity';

export interface IFeatureItemRepository {
  findById(id: string): Promise<FeatureItemEntity | null>;
  findAllByRestaurant(restaurantId: string): Promise<FeatureItemEntity[]>;
  create(item: Partial<FeatureItemEntity>): Promise<FeatureItemEntity>;
  update(id: string, data: Partial<FeatureItemEntity>): Promise<FeatureItemEntity | null>;
  delete(id: string): Promise<void>;
}

export const FEATURE_ITEM_REPOSITORY = Symbol('FEATURE_ITEM_REPOSITORY');
