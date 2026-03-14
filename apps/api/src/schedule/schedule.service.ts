import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { FeatureStatus } from '@featureboard/shared';
import type { CreateScheduledFeatureDto, UpdateScheduledFeatureDto } from '@featureboard/shared';
import type { IScheduledFeatureRepository } from './scheduled-feature.repository';
import { SCHEDULED_FEATURE_REPOSITORY } from './scheduled-feature.repository';

@Injectable()
export class ScheduleService {
  constructor(
    @Inject(SCHEDULED_FEATURE_REPOSITORY)
    private readonly scheduledFeatureRepository: IScheduledFeatureRepository,
  ) {}

  async findByDate(restaurantId: string, date: string) {
    return this.scheduledFeatureRepository.findByDate(restaurantId, date);
  }

  async findByWeek(restaurantId: string, startDate: string, endDate: string) {
    return this.scheduledFeatureRepository.findByDateRange(restaurantId, startDate, endDate);
  }

  async findById(id: string) {
    const item = await this.scheduledFeatureRepository.findById(id);
    if (!item) throw new NotFoundException('Scheduled feature not found');
    return item;
  }

  async create(dto: CreateScheduledFeatureDto, restaurantId: string) {
    return this.scheduledFeatureRepository.create({
      ...dto,
      status: dto.status ?? FeatureStatus.DRAFT,
      sortOrder: dto.sortOrder ?? 0,
      restaurantId,
    });
  }

  async update(id: string, dto: UpdateScheduledFeatureDto) {
    await this.findById(id);
    return (await this.scheduledFeatureRepository.update(id, dto))!;
  }

  async delete(id: string) {
    await this.findById(id);
    await this.scheduledFeatureRepository.delete(id);
  }

  async getLastUsedDates(restaurantId: string) {
    return this.scheduledFeatureRepository.getLastUsedDates(restaurantId);
  }

  /** Get today's published lineup for the daily lineup page */
  async getTodayLineup(restaurantId: string) {
    const today = new Date().toISOString().split('T')[0];
    const scheduled = await this.scheduledFeatureRepository.findByDate(restaurantId, today);
    return scheduled.filter((s) => s.status === FeatureStatus.PUBLISHED);
  }
}
