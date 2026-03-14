import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MealPeriod, FeatureStatus } from '@featureboard/shared';
import { FeatureItemEntity } from '../features/feature-item.entity';

@Entity('scheduled_features')
export class ScheduledFeatureEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  featureItemId!: string;

  @ManyToOne(() => FeatureItemEntity, { eager: true })
  @JoinColumn({ name: 'featureItemId' })
  featureItem!: FeatureItemEntity;

  @Column({ type: 'date' })
  serviceDate!: string;

  @Column({ type: 'enum', enum: MealPeriod })
  mealPeriod!: MealPeriod;

  @Column({ type: 'enum', enum: FeatureStatus, default: FeatureStatus.DRAFT })
  status!: FeatureStatus;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ default: 0 })
  sortOrder!: number;

  @Column({ type: 'uuid' })
  restaurantId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
