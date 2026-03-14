import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PairingEntity } from './pairing.entity';
import type { IPairingRepository } from './pairing.repository';

@Injectable()
export class TypeOrmPairingRepository implements IPairingRepository {
  constructor(
    @InjectRepository(PairingEntity)
    private readonly repo: Repository<PairingEntity>,
  ) {}

  async findById(id: string): Promise<PairingEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findAllByRestaurant(restaurantId: string): Promise<PairingEntity[]> {
    return this.repo.find({ where: { restaurantId } });
  }

  async findByFoodItem(foodItemId: string): Promise<PairingEntity[]> {
    return this.repo.find({ where: { foodItemId } });
  }

  async create(pairing: Partial<PairingEntity>): Promise<PairingEntity> {
    const entity = this.repo.create(pairing);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<PairingEntity>): Promise<PairingEntity | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
