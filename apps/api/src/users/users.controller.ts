import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '@featureboard/shared';
import type { CreateUserDto, UpdateUserDto } from '@featureboard/shared';
import { Roles, CurrentUser } from '../common/decorators';
import { RolesGuard } from '../common/guards';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.MANAGER)
  async findAll(@CurrentUser() user: { restaurantId: string }) {
    const users = await this.usersService.findAllByRestaurant(user.restaurantId);
    return users.map(({ passwordHash, ...u }) => u);
  }

  @Get(':id')
  @Roles(UserRole.MANAGER)
  async findOne(@Param('id') id: string) {
    const { passwordHash, ...user } = await this.usersService.findById(id);
    return user;
  }

  @Post()
  @Roles(UserRole.MANAGER)
  async create(
    @Body() dto: CreateUserDto,
    @CurrentUser() user: { restaurantId: string },
  ) {
    const { passwordHash, ...created } = await this.usersService.create(dto, user.restaurantId);
    return created;
  }

  @Patch(':id')
  @Roles(UserRole.MANAGER)
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const { passwordHash, ...updated } = await this.usersService.update(id, dto);
    return updated;
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    await this.usersService.delete(id);
  }
}
