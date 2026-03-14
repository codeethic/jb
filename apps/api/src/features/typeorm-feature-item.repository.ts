import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeatureItemEntity } from './feature-item.entity';
import type { IFeatureItemRepository } from './feature-item.repository';

@Injectable()
export class TypeOrmFeatureItemRepository implements IFeatureItemRepository {
  constructor(
    @InjectRepository(FeatureItemEntity)
    private readonly repo: Repository<FeatureItemEntity>,
  ) {}

  async findById(id: string): Promise<FeatureItemEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findAllByRestaurant(restaurantId: string): Promise<FeatureItemEntity[]> {
    return this.repo.find({ where: { restaurantId }, order: { name: 'ASC' } });
  }

  async create(item: Partial<FeatureItemEntity>): Promise<FeatureItemEntity> {
    const entity = this.repo.create(item);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<FeatureItemEntity>): Promise<FeatureItemEntity | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
