import { Test, TestingModule } from '@nestjs/testing';
import { FeaturesController } from './features.controller';
import { FeaturesService } from './features.service';

const mockFeature = {
  id: 'feat-1',
  name: 'Crab Cakes',
  categoryId: 'cat-1',
  description: 'Delicious',
  cost: 8.5,
  price: 18.0,
  marginPercent: 52.78,
  tags: ['seafood'],
  active: true,
  restaurantId: 'rest-1',
};

const mockService = {
  findAll: jest.fn().mockResolvedValue([mockFeature]),
  findById: jest.fn().mockResolvedValue(mockFeature),
  create: jest.fn().mockResolvedValue(mockFeature),
  update: jest.fn().mockResolvedValue(mockFeature),
  delete: jest.fn().mockResolvedValue(undefined),
};

describe('FeaturesController', () => {
  let controller: FeaturesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeaturesController],
      providers: [{ provide: FeaturesService, useValue: mockService }],
    }).compile();

    controller = module.get<FeaturesController>(FeaturesController);
    jest.clearAllMocks();
  });

  it('findAll should return features for restaurant', async () => {
    const result = await controller.findAll({ restaurantId: 'rest-1' });
    expect(result).toEqual([mockFeature]);
    expect(mockService.findAll).toHaveBeenCalledWith('rest-1');
  });

  it('findOne should return a feature by id', async () => {
    const result = await controller.findOne('feat-1');
    expect(result).toEqual(mockFeature);
  });

  it('create should create and return a feature', async () => {
    const dto = { name: 'Crab Cakes', categoryId: 'cat-1', description: 'Delicious', cost: 8.5, price: 18.0 };
    const result = await controller.create(dto, { restaurantId: 'rest-1' });
    expect(result).toEqual(mockFeature);
    expect(mockService.create).toHaveBeenCalledWith(dto, 'rest-1');
  });

  it('update should update and return a feature', async () => {
    const dto = { name: 'Updated Crab Cakes' };
    const result = await controller.update('feat-1', dto);
    expect(result).toEqual(mockFeature);
    expect(mockService.update).toHaveBeenCalledWith('feat-1', dto);
  });

  it('remove should delete a feature', async () => {
    await controller.remove('feat-1');
    expect(mockService.delete).toHaveBeenCalledWith('feat-1');
  });
});
