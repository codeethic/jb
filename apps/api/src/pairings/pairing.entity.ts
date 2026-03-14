import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FeatureItemEntity } from '../features/feature-item.entity';

@Entity('pairings')
export class PairingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  foodItemId!: string;

  @ManyToOne(() => FeatureItemEntity, { eager: true })
  @JoinColumn({ name: 'foodItemId' })
  foodItem!: FeatureItemEntity;

  @Column({ type: 'uuid' })
  wineItemId!: string;

  @ManyToOne(() => FeatureItemEntity, { eager: true })
  @JoinColumn({ name: 'wineItemId' })
  wineItem!: FeatureItemEntity;

  @Column({ type: 'text', nullable: true })
  pairingNote!: string | null;

  @Column({ type: 'uuid' })
  restaurantId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
