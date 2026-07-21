import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OpportunityService } from '../application/opportunity.service';
import { JwtAuthGuard } from '../../identity/infrastructure/jwt-auth.guard';
import { RequirePermissions } from '../../identity/infrastructure/permissions.decorator';
import { CreateOpportunityDto, UpdateOpportunityDto, ChangeStageDto, EnrollDto } from './dtos/opportunity.dto';
@ApiTags('Opportunities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('opportunities')
export class OpportunityController {
  constructor(private opportunityService: OpportunityService) {}

  @Post()
  @RequirePermissions({ module: 'opportunities', action: 'create' })
  @ApiOperation({ summary: 'Create opportunity (lead)' })
  async create(@Body() dto: CreateOpportunityDto) {
    return this.opportunityService.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'advisorId', required: false })
  @ApiQuery({ name: 'programId', required: false })
  @ApiQuery({ name: 'stageId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiOperation({ summary: 'List/search opportunities' })
  async findAll(
    @Query('advisorId') advisorId?: string,
    @Query('programId') programId?: string,
    @Query('stageId') stageId?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.opportunityService.findAll({
      advisorId, programId, stageId, search,
      page: Number(page) || 1, limit: Number(limit) || 20,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get opportunity by ID' })
  async findById(@Param('id') id: string) {
    return this.opportunityService.findById(id);
  }

  @Put(':id')
  @RequirePermissions({ module: 'opportunities', action: 'update' })
  @ApiOperation({ summary: 'Update opportunity' })
  async update(@Param('id') id: string, @Body() dto: UpdateOpportunityDto) {
    return this.opportunityService.update(id, dto);
  }

  @Put(':id/stage')
  @RequirePermissions({ module: 'opportunities', action: 'update' })
  @ApiOperation({ summary: 'Change pipeline stage' })
  async changeStage(@Param('id') id: string, @Body() dto: ChangeStageDto, @Req() req: any) {
    return this.opportunityService.changeStage(id, dto.stageId, req.user?.id || 'system');
  }

  @Post(':id/enroll')
  @RequirePermissions({ module: 'opportunities', action: 'update' })
  @ApiOperation({ summary: 'Enroll opportunity (manual enrollment)' })
  async enroll(@Param('id') id: string, @Body() dto: EnrollDto, @Req() req: any) {
    return this.opportunityService.enroll(id, dto.note, req.user?.id || 'system');
  }

  @Post(':id/reassign')
  @RequirePermissions({ module: 'opportunities', action: 'manage' })
  @ApiOperation({ summary: 'Reassign advisor (Supervisor+)' })
  async reassign(@Param('id') id: string, @Body() body: { newAdvisorId: string }, @Req() req: any) {
    return this.opportunityService.reassign(id, body.newAdvisorId, req.user?.id || 'system');
  }
}
