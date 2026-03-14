import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { MealPeriod } from '@featureboard/shared';

const mockScheduled = {
  id: 'sched-1',
  featureItemId: 'feat-1',
  serviceDate: '2026-03-14',
  mealPeriod: MealPeriod.DINNER,
  status: 'draft',
  notes: null,
  sortOrder: 0,
  restaurantId: 'rest-1',
};

const mockService = {
  findByWeek: jest.fn().mockResolvedValue([mockScheduled]),
  findById: jest.fn().mockResolvedValue(mockScheduled),
  create: jest.fn().mockResolvedValue(mockScheduled),
  update: jest.fn().mockResolvedValue(mockScheduled),
  delete: jest.fn().mockResolvedValue(undefined),
  getLastUsedDates: jest.fn().mockResolvedValue([]),
};

describe('ScheduleController', () => {
  let controller: ScheduleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduleController],
      providers: [{ provide: ScheduleService, useValue: mockService }],
    }).compile();

    controller = module.get<ScheduleController>(ScheduleController);
    jest.clearAllMocks();
  });

  it('getLastUsedDates should call service', async () => {
    const lastUsed = [{ featureItemId: 'f1', lastServiceDate: '2026-03-10' }];
    mockService.getLastUsedDates.mockResolvedValue(lastUsed);
    const result = await controller.getLastUsedDates({ restaurantId: 'rest-1' });
    expect(result).toEqual(lastUsed);
    expect(mockService.getLastUsedDates).toHaveBeenCalledWith('rest-1');
  });

  it('findByWeek should call service with date range', async () => {
    const result = await controller.findByWeek(
      { restaurantId: 'rest-1' },
      '2026-03-09',
      '2026-03-15',
    );
    expect(result).toEqual([mockScheduled]);
    expect(mockService.findByWeek).toHaveBeenCalledWith('rest-1', '2026-03-09', '2026-03-15');
  });

  it('findOne should return scheduled feature by id', async () => {
    const result = await controller.findOne('sched-1');
    expect(result).toEqual(mockScheduled);
  });

  it('create should create scheduled feature', async () => {
    const dto = { featureItemId: 'feat-1', serviceDate: '2026-03-14', mealPeriod: MealPeriod.DINNER };
    const result = await controller.create(dto, { restaurantId: 'rest-1' });
    expect(result).toEqual(mockScheduled);
    expect(mockService.create).toHaveBeenCalledWith(dto, 'rest-1');
  });

  it('update should update scheduled feature', async () => {
    const dto = { notes: 'Updated' };
    const result = await controller.update('sched-1', dto);
    expect(result).toEqual(mockScheduled);
  });

  it('remove should delete scheduled feature', async () => {
    await controller.remove('sched-1');
    expect(mockService.delete).toHaveBeenCalledWith('sched-1');
  });
});
