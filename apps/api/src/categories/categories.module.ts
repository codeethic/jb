import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from './category.entity';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { TypeOrmCategoryRepository } from './typeorm-category.repository';
import { CATEGORY_REPOSITORY } from './category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity])],
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    { provide: CATEGORY_REPOSITORY, useClass: TypeOrmCategoryRepository },
  ],
  exports: [CategoriesService],
})
export class CategoriesModule {}
