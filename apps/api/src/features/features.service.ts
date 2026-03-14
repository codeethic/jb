import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { calculateMargin } from '@featureboard/shared';
import type { CreateFeatureItemDto, UpdateFeatureItemDto } from '@featureboard/shared';
import type { IFeatureItemRepository } from './feature-item.repository';
import { FEATURE_ITEM_REPOSITORY } from './feature-item.repository';
import type { FeatureItemEntity } from './feature-item.entity';

@Injectable()
export class FeaturesService {
  constructor(
    @Inject(FEATURE_ITEM_REPOSITORY)
    private readonly featureItemRepository: IFeatureItemRepository,
  ) {}

  async findAll(restaurantId: string) {
    const items = await this.featureItemRepository.findAllByRestaurant(restaurantId);
    return items.map((item) => this.withMargin(item));
  }

  async findById(id: string) {
    const item = await this.featureItemRepository.findById(id);
    if (!item) throw new NotFoundException('Feature item not found');
    return this.withMargin(item);
  }

  async create(dto: CreateFeatureItemDto, restaurantId: string) {
    const item = await this.featureItemRepository.create({
      ...dto,
      tags: dto.tags ?? [],
      restaurantId,
    });
    return this.withMargin(item);
  }

  async update(id: string, dto: UpdateFeatureItemDto) {
    await this.findById(id); // throws if not found
    const item = await this.featureItemRepository.update(id, dto);
    return this.withMargin(item!);
  }

  async delete(id: string) {
    await this.findById(id); // throws if not found
    await this.featureItemRepository.delete(id);
  }

  private withMargin(item: FeatureItemEntity) {
    return {
      ...item,
      marginPercent: calculateMargin(Number(item.price), Number(item.cost)),
    };
  }
}
