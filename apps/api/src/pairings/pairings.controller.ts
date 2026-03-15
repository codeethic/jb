import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '@featureboard/shared';
import type { CreatePairingDto, UpdatePairingDto } from '@featureboard/shared';
import { Roles, CurrentUser } from '../common/decorators';
import { RolesGuard } from '../common/guards';
import { PairingsService } from './pairings.service';

@Controller('pairings')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PairingsController {
  constructor(private readonly pairingsService: PairingsService) {}

  @Get()
  @Roles(UserRole.SERVER)
  async findAll(@CurrentUser() user: { restaurantId: string }) {
    return this.pairingsService.findAll(user.restaurantId);
  }

  @Get(':id')
  @Roles(UserRole.SERVER)
  async findOne(@Param('id') id: string) {
    return this.pairingsService.findById(id);
  }

  @Post()
  @Roles(UserRole.CHEF)
  async create(
    @Body() dto: CreatePairingDto,
    @CurrentUser() user: { restaurantId: string },
  ) {
    return this.pairingsService.create(dto, user.restaurantId);
  }

  @Patch(':id')
  @Roles(UserRole.CHEF)
  async update(@Param('id') id: string, @Body() dto: UpdatePairingDto) {
    return this.pairingsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.MANAGER)
  async remove(@Param('id') id: string) {
    await this.pairingsService.delete(id);
  }
}
