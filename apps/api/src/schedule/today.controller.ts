import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '@featureboard/shared';
import { Roles, CurrentUser } from '../common/decorators';
import { RolesGuard } from '../common/guards';
import { ScheduleService } from './schedule.service';

/**
 * /today — Read-only endpoint for today's published lineup.
 * Accessible to all roles (servers view this on phones).
 */
@Controller('today')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TodayController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  @Roles(UserRole.SERVER, UserRole.CHEF, UserRole.MANAGER, UserRole.ADMIN)
  async getTodayLineup(@CurrentUser() user: { restaurantId: string }) {
    return this.scheduleService.getTodayLineup(user.restaurantId);
  }
}
