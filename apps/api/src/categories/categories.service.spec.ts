import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CATEGORY_REPOSITORY } from './category.repository';

const mockCategory = {
  id: '550e8400-e29b-41d4-a716-446655440030',
  name: 'Appetizer',
  sortOrder: 0,
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

describe('CategoriesService', () => {
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: CATEGORY_REPOSITORY, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all categories for a restaurant', async () => {
      mockRepo.findAllByRestaurant.mockResolvedValue([mockCategory]);
      const result = await service.findAll(mockCategory.restaurantId);
      expect(result).toEqual([mockCategory]);
      expect(mockRepo.findAllByRestaurant).toHaveBeenCalledWith(mockCategory.restaurantId);
    });
  });

  describe('findById', () => {
    it('should return category when found', async () => {
      mockRepo.findById.mockResolvedValue(mockCategory);
      const result = await service.findById(mockCategory.id);
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a category', async () => {
      mockRepo.create.mockResolvedValue(mockCategory);
      const result = await service.create({ name: 'Appetizer', sortOrder: 0 }, mockCategory.restaurantId);
      expect(result).toEqual(mockCategory);
      expect(mockRepo.create).toHaveBeenCalledWith({
        name: 'Appetizer',
        sortOrder: 0,
        restaurantId: mockCategory.restaurantId,
      });
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updated = { ...mockCategory, name: 'Soup' };
      mockRepo.findById.mockResolvedValue(mockCategory);
      mockRepo.update.mockResolvedValue(updated);
      const result = await service.update(mockCategory.id, { name: 'Soup' });
      expect(result.name).toBe('Soup');
    });

    it('should throw NotFoundException when updating non-existent category', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.update('nonexistent', { name: 'Soup' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a category', async () => {
      mockRepo.findById.mockResolvedValue(mockCategory);
      mockRepo.delete.mockResolvedValue(undefined);
      await service.delete(mockCategory.id);
      expect(mockRepo.delete).toHaveBeenCalledWith(mockCategory.id);
    });

    it('should throw NotFoundException when deleting non-existent category', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
