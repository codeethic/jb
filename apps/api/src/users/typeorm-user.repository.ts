import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import type { IUserRepository } from './user.repository';

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<UserEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findAllByRestaurant(restaurantId: string): Promise<UserEntity[]> {
    return this.repo.find({ where: { restaurantId } });
  }

  async create(user: Partial<UserEntity>): Promise<UserEntity> {
    const entity = this.repo.create(user);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<UserEntity>): Promise<UserEntity | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
