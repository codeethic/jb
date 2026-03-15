import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '@featureboard/shared';
import type { CreateScheduledFeatureDto, UpdateScheduledFeatureDto } from '@featureboard/shared';
import { Roles, CurrentUser } from '../common/decorators';
import { RolesGuard } from '../common/guards';
import { ScheduleService } from './schedule.service';

@Controller('schedule')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('last-used')
  @Roles(UserRole.SERVER)
  async getLastUsedDates(@CurrentUser() user: { restaurantId: string }) {
    return this.scheduleService.getLastUsedDates(user.restaurantId);
  }

  @Get()
  @Roles(UserRole.CHEF)
  async findByWeek(
    @CurrentUser() user: { restaurantId: string },
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.scheduleService.findByWeek(user.restaurantId, startDate, endDate);
  }

  @Get(':id')
  @Roles(UserRole.CHEF)
  async findOne(@Param('id') id: string) {
    return this.scheduleService.findById(id);
  }

  @Post()
  @Roles(UserRole.CHEF)
  async create(
    @Body() dto: CreateScheduledFeatureDto,
    @CurrentUser() user: { restaurantId: string },
  ) {
    return this.scheduleService.create(dto, user.restaurantId);
  }

  @Patch(':id')
  @Roles(UserRole.CHEF)
  async update(@Param('id') id: string, @Body() dto: UpdateScheduledFeatureDto) {
    return this.scheduleService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.MANAGER)
  async remove(@Param('id') id: string) {
    await this.scheduleService.delete(id);
  }
}
