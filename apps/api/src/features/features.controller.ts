import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '@featureboard/shared';
import type { CreateFeatureItemDto, UpdateFeatureItemDto } from '@featureboard/shared';
import { Roles, CurrentUser } from '../common/decorators';
import { RolesGuard } from '../common/guards';
import { FeaturesService } from './features.service';

@Controller('features')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class FeaturesController {
  constructor(private readonly featuresService: FeaturesService) {}

  @Get()
  @Roles(UserRole.SERVER)
  async findAll(@CurrentUser() user: { restaurantId: string }) {
    return this.featuresService.findAll(user.restaurantId);
  }

  @Get(':id')
  @Roles(UserRole.SERVER)
  async findOne(@Param('id') id: string) {
    return this.featuresService.findById(id);
  }

  @Post()
  @Roles(UserRole.CHEF)
  async create(
    @Body() dto: CreateFeatureItemDto,
    @CurrentUser() user: { restaurantId: string },
  ) {
    return this.featuresService.create(dto, user.restaurantId);
  }

  @Patch(':id')
  @Roles(UserRole.CHEF)
  async update(@Param('id') id: string, @Body() dto: UpdateFeatureItemDto) {
    return this.featuresService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.MANAGER)
  async remove(@Param('id') id: string) {
    await this.featuresService.delete(id);
  }
}
