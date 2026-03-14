import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { CreateUserDto, UpdateUserDto } from '@featureboard/shared';
import type { IUserRepository } from './user.repository';
import { USER_REPOSITORY } from './user.repository';
import type { UserEntity } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async findById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findByEmail(email);
  }

  async findAllByRestaurant(restaurantId: string): Promise<UserEntity[]> {
    return this.userRepository.findAllByRestaurant(restaurantId);
  }

  async create(dto: CreateUserDto, restaurantId: string): Promise<UserEntity> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.userRepository.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
      role: dto.role,
      restaurantId,
    });
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.userRepository.update(id, dto);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id); // throws if not found
    await this.userRepository.delete(id);
  }
}
