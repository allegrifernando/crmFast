import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ActivityService } from '../application/activity.service';
import { JwtAuthGuard } from '../../identity/infrastructure/jwt-auth.guard';
import { RequirePermissions } from '../../identity/infrastructure/permissions.decorator';
import { CreateActivityDto } from './dtos/activity.dto';

@ApiTags('Activities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Post()
  @RequirePermissions({ module: 'activities', action: 'create' })
  @ApiOperation({ summary: 'Create activity event (append-only)' })
  async create(@Body() dto: CreateActivityDto, @Req() req: any) {
    return this.activityService.create({
      ...dto,
      actorId: req.user.id,
    });
  }

  @Get('by-opportunity/:opportunityId')
  @RequirePermissions({ module: 'activities', action: 'read' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiOperation({ summary: 'Get activity timeline for an opportunity' })
  async findByOpportunity(
    @Param('opportunityId') opportunityId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.activityService.findByOpportunity(opportunityId, Number(page) || 1, Number(limit) || 50);
  }
}
