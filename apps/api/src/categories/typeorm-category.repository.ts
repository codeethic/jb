import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from './category.entity';
import type { ICategoryRepository } from './category.repository';

@Injectable()
export class TypeOrmCategoryRepository implements ICategoryRepository {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly repo: Repository<CategoryEntity>,
  ) {}

  async findById(id: string): Promise<CategoryEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findAllByRestaurant(restaurantId: string): Promise<CategoryEntity[]> {
    return this.repo.find({ where: { restaurantId }, order: { sortOrder: 'ASC' } });
  }

  async create(category: Partial<CategoryEntity>): Promise<CategoryEntity> {
    const entity = this.repo.create(category);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<CategoryEntity>): Promise<CategoryEntity | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
