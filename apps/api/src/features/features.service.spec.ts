import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FeaturesService } from './features.service';
import { FEATURE_ITEM_REPOSITORY } from './feature-item.repository';

const mockFeatureItem = {
  id: '550e8400-e29b-41d4-a716-446655440010',
  name: 'Crab Cakes',
  categoryId: '550e8400-e29b-41d4-a716-446655440020',
  description: 'Pan-seared lump crab with lemon aioli',
  ingredients: null,
  allergens: 'shellfish',
  prepNotes: null,
  platingNotes: null,
  cost: 8.5,
  price: 18.0,
  imageUrl: null,
  tags: ['seafood', 'appetizer'],
  active: true,
  restaurantId: '550e8400-e29b-41d4-a716-446655440000',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRepo = {
  findById: jest.fn(),
  findAllByRestaurant: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('FeaturesService', () => {
  let service: FeaturesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeaturesService,
        { provide: FEATURE_ITEM_REPOSITORY, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<FeaturesService>(FeaturesService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all features with margin', async () => {
      mockRepo.findAllByRestaurant.mockResolvedValue([mockFeatureItem]);
      const result = await service.findAll(mockFeatureItem.restaurantId);

      expect(result).toHaveLength(1);
      expect(result[0].marginPercent).toBeCloseTo(52.78, 1);
    });
  });

  describe('findById', () => {
    it('should return feature with margin when found', async () => {
      mockRepo.findById.mockResolvedValue(mockFeatureItem);
      const result = await service.findById(mockFeatureItem.id);

      expect(result.name).toBe('Crab Cakes');
      expect(result.marginPercent).toBeCloseTo(52.78, 1);
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create feature and return with margin', async () => {
      mockRepo.create.mockResolvedValue(mockFeatureItem);
      const result = await service.create(
        {
          name: 'Crab Cakes',
          categoryId: mockFeatureItem.categoryId,
          description: 'Pan-seared lump crab with lemon aioli',
          cost: 8.5,
          price: 18.0,
          tags: ['seafood', 'appetizer'],
        },
        mockFeatureItem.restaurantId,
      );

      expect(result.name).toBe('Crab Cakes');
      expect(result.marginPercent).toBeCloseTo(52.78, 1);
    });
  });
});
