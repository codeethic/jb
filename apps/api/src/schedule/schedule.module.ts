import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduledFeatureEntity } from './scheduled-feature.entity';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { TodayController } from './today.controller';
import { TypeOrmScheduledFeatureRepository } from './typeorm-scheduled-feature.repository';
import { SCHEDULED_FEATURE_REPOSITORY } from './scheduled-feature.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduledFeatureEntity])],
  controllers: [ScheduleController, TodayController],
  providers: [
    ScheduleService,
    { provide: SCHEDULED_FEATURE_REPOSITORY, useClass: TypeOrmScheduledFeatureRepository },
  ],
  exports: [ScheduleService],
})
export class ScheduleModule {}
