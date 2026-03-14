import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { CreateCategoryDto } from '@featureboard/shared';
import type { ICategoryRepository } from './category.repository';
import { CATEGORY_REPOSITORY } from './category.repository';

@Injectable()
export class CategoriesService {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async findAll(restaurantId: string) {
    return this.categoryRepository.findAllByRestaurant(restaurantId);
  }

  async findById(id: string) {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(dto: CreateCategoryDto, restaurantId: string) {
    return this.categoryRepository.create({ ...dto, restaurantId });
  }

  async update(id: string, dto: Partial<CreateCategoryDto>) {
    await this.findById(id);
    const updated = await this.categoryRepository.update(id, dto);
    return updated!;
  }

  async delete(id: string) {
    await this.findById(id);
    await this.categoryRepository.delete(id);
  }
}
