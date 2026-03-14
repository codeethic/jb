import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { CreatePairingDto, UpdatePairingDto } from '@featureboard/shared';
import type { IPairingRepository } from './pairing.repository';
import { PAIRING_REPOSITORY } from './pairing.repository';

@Injectable()
export class PairingsService {
  constructor(
    @Inject(PAIRING_REPOSITORY)
    private readonly pairingRepository: IPairingRepository,
  ) {}

  async findAll(restaurantId: string) {
    return this.pairingRepository.findAllByRestaurant(restaurantId);
  }

  async findById(id: string) {
    const pairing = await this.pairingRepository.findById(id);
    if (!pairing) throw new NotFoundException('Pairing not found');
    return pairing;
  }

  async findByFoodItem(foodItemId: string) {
    return this.pairingRepository.findByFoodItem(foodItemId);
  }

  async create(dto: CreatePairingDto, restaurantId: string) {
    return this.pairingRepository.create({ ...dto, restaurantId });
  }

  async update(id: string, dto: UpdatePairingDto) {
    await this.findById(id);
    return (await this.pairingRepository.update(id, dto))!;
  }

  async delete(id: string) {
    await this.findById(id);
    await this.pairingRepository.delete(id);
  }
}
