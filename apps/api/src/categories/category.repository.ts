import type { CategoryEntity } from './category.entity';

export interface ICategoryRepository {
  findById(id: string): Promise<CategoryEntity | null>;
  findAllByRestaurant(restaurantId: string): Promise<CategoryEntity[]>;
  create(category: Partial<CategoryEntity>): Promise<CategoryEntity>;
  update(id: string, data: Partial<CategoryEntity>): Promise<CategoryEntity | null>;
  delete(id: string): Promise<void>;
}

export const CATEGORY_REPOSITORY = Symbol('CATEGORY_REPOSITORY');
