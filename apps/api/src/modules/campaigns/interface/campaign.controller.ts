import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CampaignService } from '../application/campaign.service';
import { JwtAuthGuard } from '../../identity/infrastructure/jwt-auth.guard';
import { RequirePermissions } from '../../identity/infrastructure/permissions.decorator';
import { CreateCampaignDto, UpdateCampaignDto } from './dtos/campaign.dto';

@ApiTags('Campaigns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('campaigns')
export class CampaignController {
  constructor(private campaignService: CampaignService) {}

  @Post()
  @RequirePermissions({ module: 'campaigns', action: 'create' })
  @ApiOperation({ summary: 'Create campaign' })
  async create(@Body() dto: CreateCampaignDto) {
    return this.campaignService.create(dto);
  }

  @Get()
  @RequirePermissions({ module: 'campaigns', action: 'read' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  @ApiOperation({ summary: 'List campaigns' })
  async findAll(@Query('includeInactive') includeInactive?: string) {
    return this.campaignService.findAll(includeInactive === 'true');
  }

  @Get('metrics')
  @RequirePermissions({ module: 'campaigns', action: 'read' })
  @ApiQuery({ name: 'campaignId', required: false })
  @ApiOperation({ summary: 'Get campaign metrics (cost-per-lead, cost-per-enrollment)' })
  async getMetrics(@Query('campaignId') campaignId?: string) {
    return this.campaignService.getMetrics(campaignId);
  }

  @Get(':id')
  @RequirePermissions({ module: 'campaigns', action: 'read' })
  @ApiOperation({ summary: 'Get campaign by ID' })
  async findById(@Param('id') id: string) {
    return this.campaignService.findById(id);
  }

  @Put(':id')
  @RequirePermissions({ module: 'campaigns', action: 'update' })
  @ApiOperation({ summary: 'Update campaign' })
  async update(@Param('id') id: string, @Body() dto: UpdateCampaignDto) {
    return this.campaignService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions({ module: 'campaigns', action: 'delete' })
  @ApiOperation({ summary: 'Deactivate campaign' })
  async remove(@Param('id') id: string) {
    return this.campaignService.remove(id);
  }
}