import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CategoryEntity } from '../categories/category.entity';

@Entity('feature_items')
export class FeatureItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'uuid' })
  categoryId!: string;

  @ManyToOne(() => CategoryEntity, { eager: true })
  @JoinColumn({ name: 'categoryId' })
  category!: CategoryEntity;

  @Column({ type: 'text', default: '' })
  description!: string;

  @Column({ type: 'text', nullable: true })
  ingredients!: string | null;

  @Column({ type: 'text', nullable: true })
  allergens!: string | null;

  @Column({ type: 'text', nullable: true })
  prepNotes!: string | null;

  @Column({ type: 'text', nullable: true })
  platingNotes!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cost!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price!: number;

  @Column({ type: 'text', nullable: true })
  imageUrl!: string | null;

  @Column({ type: 'jsonb', default: '[]' })
  tags!: string[];

  @Column({ default: true })
  active!: boolean;

  @Column({ type: 'uuid' })
  restaurantId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
