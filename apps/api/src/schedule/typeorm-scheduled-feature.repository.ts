import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import type { MealPeriod } from '@featureboard/shared';
import { ScheduledFeatureEntity } from './scheduled-feature.entity';
import type { IScheduledFeatureRepository } from './scheduled-feature.repository';

@Injectable()
export class TypeOrmScheduledFeatureRepository implements IScheduledFeatureRepository {
  constructor(
    @InjectRepository(ScheduledFeatureEntity)
    private readonly repo: Repository<ScheduledFeatureEntity>,
  ) {}

  async findById(id: string): Promise<ScheduledFeatureEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByDate(restaurantId: string, date: string): Promise<ScheduledFeatureEntity[]> {
    return this.repo.find({
      where: { restaurantId, serviceDate: date },
      order: { sortOrder: 'ASC' },
    });
  }

  async findByDateRange(
    restaurantId: string,
    startDate: string,
    endDate: string,
  ): Promise<ScheduledFeatureEntity[]> {
    return this.repo.find({
      where: { restaurantId, serviceDate: Between(startDate, endDate) },
      order: { serviceDate: 'ASC', sortOrder: 'ASC' },
    });
  }

  async findByDateAndPeriod(
    restaurantId: string,
    date: string,
    mealPeriod: MealPeriod,
  ): Promise<ScheduledFeatureEntity[]> {
    return this.repo.find({
      where: { restaurantId, serviceDate: date, mealPeriod },
      order: { sortOrder: 'ASC' },
    });
  }

  async create(item: Partial<ScheduledFeatureEntity>): Promise<ScheduledFeatureEntity> {
    const entity = this.repo.create(item);
    return this.repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<ScheduledFeatureEntity>,
  ): Promise<ScheduledFeatureEntity | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async getLastUsedDates(
    restaurantId: string,
  ): Promise<{ featureItemId: string; lastServiceDate: string }[]> {
    const rows = await this.repo
      .createQueryBuilder('sf')
      .select('sf.featureItemId', 'featureItemId')
      .addSelect('MAX(sf.serviceDate)', 'lastServiceDate')
      .where('sf.restaurantId = :restaurantId', { restaurantId })
      .groupBy('sf.featureItemId')
      .getRawMany();
    return rows;
  }
}
