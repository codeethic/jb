import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { USER_REPOSITORY } from './user.repository';
import { UserRole } from '@featureboard/shared';
import type { UserEntity } from './user.entity';

const mockUser: UserEntity = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  email: 'chef@test.com',
  name: 'Test Chef',
  passwordHash: '$2b$10$hashedpassword',
  role: UserRole.CHEF,
  restaurantId: '550e8400-e29b-41d4-a716-446655440000',
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUserRepository = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findAllByRestaurant: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: USER_REPOSITORY, useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      const result = await service.findById(mockUser.id);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await service.create(
        { email: 'chef@test.com', name: 'Test Chef', password: 'password123', role: UserRole.CHEF },
        mockUser.restaurantId,
      );

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'chef@test.com', name: 'Test Chef' }),
      );
    });

    it('should throw ConflictException if email exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.create(
          { email: 'chef@test.com', name: 'Test Chef', password: 'pw', role: UserRole.CHEF },
          mockUser.restaurantId,
        ),
      ).rejects.toThrow(ConflictException);
    });
  });
});
