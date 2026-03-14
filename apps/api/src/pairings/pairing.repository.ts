import type { PairingEntity } from './pairing.entity';

export interface IPairingRepository {
  findById(id: string): Promise<PairingEntity | null>;
  findAllByRestaurant(restaurantId: string): Promise<PairingEntity[]>;
  findByFoodItem(foodItemId: string): Promise<PairingEntity[]>;
  create(pairing: Partial<PairingEntity>): Promise<PairingEntity>;
  update(id: string, data: Partial<PairingEntity>): Promise<PairingEntity | null>;
  delete(id: string): Promise<void>;
}

export const PAIRING_REPOSITORY = Symbol('PAIRING_REPOSITORY');
