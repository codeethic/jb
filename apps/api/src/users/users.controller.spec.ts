import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole } from '@featureboard/shared';

const mockUser = {
  id: 'user-1',
  email: 'test@demo.com',
  name: 'Test User',
  passwordHash: '$2b$10$hashed',
  role: UserRole.CHEF,
  restaurantId: 'rest-1',
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockService = {
  findAllByRestaurant: jest.fn().mockResolvedValue([mockUser]),
  findById: jest.fn().mockResolvedValue(mockUser),
  create: jest.fn().mockResolvedValue(mockUser),
  update: jest.fn().mockResolvedValue(mockUser),
  delete: jest.fn().mockResolvedValue(undefined),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('findAll should strip passwordHash from all users', async () => {
    mockService.findAllByRestaurant.mockResolvedValue([mockUser]);
    const result = await controller.findAll({ restaurantId: 'rest-1' });
    expect(result).toHaveLength(1);
    expect(result[0]).not.toHaveProperty('passwordHash');
    expect(result[0].name).toBe('Test User');
  });

  it('findOne should strip passwordHash', async () => {
    mockService.findById.mockResolvedValue(mockUser);
    const result = await controller.findOne('user-1');
    expect(result).not.toHaveProperty('passwordHash');
    expect(result.email).toBe('test@demo.com');
  });

  it('create should strip passwordHash from created user', async () => {
    mockService.create.mockResolvedValue(mockUser);
    const dto = { email: 'test@demo.com', name: 'Test User', password: 'pass', role: UserRole.CHEF };
    const result = await controller.create(dto, { restaurantId: 'rest-1' });
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('update should strip passwordHash from updated user', async () => {
    mockService.update.mockResolvedValue(mockUser);
    const result = await controller.update('user-1', { name: 'Updated' });
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('remove should delete a user', async () => {
    await controller.remove('user-1');
    expect(mockService.delete).toHaveBeenCalledWith('user-1');
  });
});
