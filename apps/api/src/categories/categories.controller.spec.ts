import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

const mockCategory = {
  id: 'cat-1',
  name: 'Appetizer',
  sortOrder: 0,
  restaurantId: 'rest-1',
};

const mockService = {
  findAll: jest.fn().mockResolvedValue([mockCategory]),
  create: jest.fn().mockResolvedValue(mockCategory),
  update: jest.fn().mockResolvedValue(mockCategory),
  delete: jest.fn().mockResolvedValue(undefined),
};

describe('CategoriesController', () => {
  let controller: CategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [{ provide: CategoriesService, useValue: mockService }],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    jest.clearAllMocks();
  });

  it('findAll should return categories', async () => {
    const result = await controller.findAll({ restaurantId: 'rest-1' });
    expect(result).toEqual([mockCategory]);
    expect(mockService.findAll).toHaveBeenCalledWith('rest-1');
  });

  it('create should create a category', async () => {
    const dto = { name: 'Appetizer', sortOrder: 0 };
    const result = await controller.create(dto, { restaurantId: 'rest-1' });
    expect(result).toEqual(mockCategory);
    expect(mockService.create).toHaveBeenCalledWith(dto, 'rest-1');
  });

  it('update should update a category', async () => {
    const dto = { name: 'Soup' };
    const result = await controller.update('cat-1', dto);
    expect(result).toEqual(mockCategory);
    expect(mockService.update).toHaveBeenCalledWith('cat-1', dto);
  });

  it('remove should delete a category', async () => {
    await controller.remove('cat-1');
    expect(mockService.delete).toHaveBeenCalledWith('cat-1');
  });
});
