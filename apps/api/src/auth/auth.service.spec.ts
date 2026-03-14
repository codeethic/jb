import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { USER_REPOSITORY } from '../users/user.repository';
import { UserRole } from '@featureboard/shared';

const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  email: 'chef@test.com',
  name: 'Test Chef',
  passwordHash: '',
  role: UserRole.CHEF,
  restaurantId: '550e8400-e29b-41d4-a716-446655440000',
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUserRepository = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  findAllByRestaurant: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    mockUser.passwordHash = await bcrypt.hash('password123', 10);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: USER_REPOSITORY, useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return access token on valid credentials', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      // Need to re-hash since clearAllMocks resets
      mockUser.passwordHash = await bcrypt.hash('password123', 10);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.login({ email: 'chef@test.com', password: 'password123' });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe('chef@test.com');
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.login({ email: 'chef@test.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for unknown email', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@test.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
