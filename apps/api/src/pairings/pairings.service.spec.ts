import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PairingsService } from './pairings.service';
import { PAIRING_REPOSITORY } from './pairing.repository';

const mockPairing = {
  id: '550e8400-e29b-41d4-a716-446655440040',
  foodItemId: '550e8400-e29b-41d4-a716-446655440010',
  wineItemId: '550e8400-e29b-41d4-a716-446655440011',
  pairingNote: 'Pairs well together',
  restaurantId: '550e8400-e29b-41d4-a716-446655440000',
  foodItem: {} as any,
  wineItem: {} as any,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRepo = {
  findById: jest.fn(),
  findAllByRestaurant: jest.fn(),
  findByFoodItem: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('PairingsService', () => {
  let service: PairingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PairingsService,
        { provide: PAIRING_REPOSITORY, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<PairingsService>(PairingsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all pairings for a restaurant', async () => {
      mockRepo.findAllByRestaurant.mockResolvedValue([mockPairing]);
      const result = await service.findAll(mockPairing.restaurantId);
      expect(result).toEqual([mockPairing]);
    });
  });

  describe('findById', () => {
    it('should return pairing when found', async () => {
      mockRepo.findById.mockResolvedValue(mockPairing);
      const result = await service.findById(mockPairing.id);
      expect(result).toEqual(mockPairing);
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByFoodItem', () => {
    it('should return pairings for a food item', async () => {
      mockRepo.findByFoodItem.mockResolvedValue([mockPairing]);
      const result = await service.findByFoodItem(mockPairing.foodItemId);
      expect(result).toEqual([mockPairing]);
    });
  });

  describe('create', () => {
    it('should create a pairing', async () => {
      mockRepo.create.mockResolvedValue(mockPairing);
      const dto = {
        foodItemId: mockPairing.foodItemId,
        wineItemId: mockPairing.wineItemId,
        pairingNote: 'Pairs well together',
      };
      const result = await service.create(dto, mockPairing.restaurantId);
      expect(result).toEqual(mockPairing);
      expect(mockRepo.create).toHaveBeenCalledWith({
        ...dto,
        restaurantId: mockPairing.restaurantId,
      });
    });
  });

  describe('update', () => {
    it('should update a pairing', async () => {
      const updated = { ...mockPairing, pairingNote: 'Updated note' };
      mockRepo.findById.mockResolvedValue(mockPairing);
      mockRepo.update.mockResolvedValue(updated);
      const result = await service.update(mockPairing.id, { pairingNote: 'Updated note' });
      expect(result.pairingNote).toBe('Updated note');
    });

    it('should throw NotFoundException when updating non-existent pairing', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.update('nonexistent', { pairingNote: 'x' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a pairing', async () => {
      mockRepo.findById.mockResolvedValue(mockPairing);
      mockRepo.delete.mockResolvedValue(undefined);
      await service.delete(mockPairing.id);
      expect(mockRepo.delete).toHaveBeenCalledWith(mockPairing.id);
    });

    it('should throw NotFoundException when deleting non-existent pairing', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
