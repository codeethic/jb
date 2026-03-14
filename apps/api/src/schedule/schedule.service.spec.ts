import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { SCHEDULED_FEATURE_REPOSITORY } from './scheduled-feature.repository';
import { FeatureStatus, MealPeriod } from '@featureboard/shared';

const restaurantId = '550e8400-e29b-41d4-a716-446655440000';

const mockScheduledFeature = {
  id: '550e8400-e29b-41d4-a716-446655440050',
  featureItemId: '550e8400-e29b-41d4-a716-446655440010',
  featureItem: { id: '550e8400-e29b-41d4-a716-446655440010', name: 'Crab Cakes' } as any,
  serviceDate: '2026-03-14',
  mealPeriod: MealPeriod.DINNER,
  status: FeatureStatus.DRAFT,
  notes: null,
  sortOrder: 0,
  restaurantId,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRepo = {
  findById: jest.fn(),
  findByDate: jest.fn(),
  findByDateRange: jest.fn(),
  findByDateAndPeriod: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getLastUsedDates: jest.fn(),
};

describe('ScheduleService', () => {
  let service: ScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        { provide: SCHEDULED_FEATURE_REPOSITORY, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
    jest.clearAllMocks();
  });

  describe('findByDate', () => {
    it('should return scheduled features for a date', async () => {
      mockRepo.findByDate.mockResolvedValue([mockScheduledFeature]);
      const result = await service.findByDate(restaurantId, '2026-03-14');
      expect(result).toEqual([mockScheduledFeature]);
    });
  });

  describe('findByWeek', () => {
    it('should return scheduled features for a date range', async () => {
      mockRepo.findByDateRange.mockResolvedValue([mockScheduledFeature]);
      const result = await service.findByWeek(restaurantId, '2026-03-09', '2026-03-15');
      expect(result).toEqual([mockScheduledFeature]);
    });
  });

  describe('findById', () => {
    it('should return scheduled feature when found', async () => {
      mockRepo.findById.mockResolvedValue(mockScheduledFeature);
      const result = await service.findById(mockScheduledFeature.id);
      expect(result).toEqual(mockScheduledFeature);
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a scheduled feature with defaults', async () => {
      mockRepo.create.mockResolvedValue(mockScheduledFeature);
      const dto = {
        featureItemId: mockScheduledFeature.featureItemId,
        serviceDate: '2026-03-14',
        mealPeriod: MealPeriod.DINNER,
      };
      const result = await service.create(dto, restaurantId);
      expect(result).toEqual(mockScheduledFeature);
      expect(mockRepo.create).toHaveBeenCalledWith({
        ...dto,
        status: FeatureStatus.DRAFT,
        sortOrder: 0,
        restaurantId,
      });
    });

    it('should preserve explicit status when provided', async () => {
      mockRepo.create.mockResolvedValue({ ...mockScheduledFeature, status: FeatureStatus.PUBLISHED });
      const dto = {
        featureItemId: mockScheduledFeature.featureItemId,
        serviceDate: '2026-03-14',
        mealPeriod: MealPeriod.DINNER,
        status: FeatureStatus.PUBLISHED,
      };
      await service.create(dto, restaurantId);
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: FeatureStatus.PUBLISHED }),
      );
    });
  });

  describe('update', () => {
    it('should update a scheduled feature', async () => {
      const updated = { ...mockScheduledFeature, status: FeatureStatus.PUBLISHED };
      mockRepo.findById.mockResolvedValue(mockScheduledFeature);
      mockRepo.update.mockResolvedValue(updated);
      const result = await service.update(mockScheduledFeature.id, { status: FeatureStatus.PUBLISHED });
      expect(result.status).toBe(FeatureStatus.PUBLISHED);
    });

    it('should throw NotFoundException when updating non-existent', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.update('nonexistent', { notes: 'x' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a scheduled feature', async () => {
      mockRepo.findById.mockResolvedValue(mockScheduledFeature);
      mockRepo.delete.mockResolvedValue(undefined);
      await service.delete(mockScheduledFeature.id);
      expect(mockRepo.delete).toHaveBeenCalledWith(mockScheduledFeature.id);
    });

    it('should throw NotFoundException when deleting non-existent', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTodayLineup', () => {
    it('should return only published features for today', async () => {
      const published = { ...mockScheduledFeature, status: FeatureStatus.PUBLISHED };
      const draft = { ...mockScheduledFeature, id: 'draft-id', status: FeatureStatus.DRAFT };
      mockRepo.findByDate.mockResolvedValue([published, draft]);

      const result = await service.getTodayLineup(restaurantId);
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(FeatureStatus.PUBLISHED);
    });
  });

  describe('getLastUsedDates', () => {
    it('should return last used dates from repository', async () => {
      const lastUsed = [{ featureItemId: 'item-1', lastServiceDate: '2026-03-10' }];
      mockRepo.getLastUsedDates.mockResolvedValue(lastUsed);
      const result = await service.getLastUsedDates(restaurantId);
      expect(result).toEqual(lastUsed);
    });
  });
});
