import { Test, TestingModule } from '@nestjs/testing';
import { PairingsController } from './pairings.controller';
import { PairingsService } from './pairings.service';

const mockPairing = {
  id: 'pair-1',
  foodItemId: 'feat-1',
  wineItemId: 'feat-2',
  pairingNote: 'Great match',
  restaurantId: 'rest-1',
};

const mockService = {
  findAll: jest.fn().mockResolvedValue([mockPairing]),
  findById: jest.fn().mockResolvedValue(mockPairing),
  findByFoodItem: jest.fn().mockResolvedValue([mockPairing]),
  create: jest.fn().mockResolvedValue(mockPairing),
  update: jest.fn().mockResolvedValue(mockPairing),
  delete: jest.fn().mockResolvedValue(undefined),
};

describe('PairingsController', () => {
  let controller: PairingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PairingsController],
      providers: [{ provide: PairingsService, useValue: mockService }],
    }).compile();

    controller = module.get<PairingsController>(PairingsController);
    jest.clearAllMocks();
  });

  it('findAll should return pairings', async () => {
    const result = await controller.findAll({ restaurantId: 'rest-1' });
    expect(result).toEqual([mockPairing]);
  });

  it('findOne should return a pairing', async () => {
    const result = await controller.findOne('pair-1');
    expect(result).toEqual(mockPairing);
  });

  it('create should create a pairing', async () => {
    const dto = { foodItemId: 'feat-1', wineItemId: 'feat-2', pairingNote: 'Great match' };
    const result = await controller.create(dto, { restaurantId: 'rest-1' });
    expect(result).toEqual(mockPairing);
  });

  it('update should update a pairing', async () => {
    const dto = { pairingNote: 'Updated' };
    const result = await controller.update('pair-1', dto);
    expect(result).toEqual(mockPairing);
  });

  it('remove should delete a pairing', async () => {
    await controller.remove('pair-1');
    expect(mockService.delete).toHaveBeenCalledWith('pair-1');
  });
});
