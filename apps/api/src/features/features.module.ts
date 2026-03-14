import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeatureItemEntity } from './feature-item.entity';
import { FeaturesService } from './features.service';
import { FeaturesController } from './features.controller';
import { TypeOrmFeatureItemRepository } from './typeorm-feature-item.repository';
import { FEATURE_ITEM_REPOSITORY } from './feature-item.repository';

@Module({
  imports: [TypeOrmModule.forFeature([FeatureItemEntity])],
  controllers: [FeaturesController],
  providers: [
    FeaturesService,
    { provide: FEATURE_ITEM_REPOSITORY, useClass: TypeOrmFeatureItemRepository },
  ],
  exports: [FeaturesService],
})
export class FeaturesModule {}
