import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PipelineService } from '../application/pipeline.service';
import { JwtAuthGuard } from '../../identity/infrastructure/jwt-auth.guard';
import { RequirePermissions } from '../../identity/infrastructure/permissions.decorator';
import { Public } from '../../identity/infrastructure/public.decorator';
import { CreateStageDto, UpdateStageDto } from './dtos/pipeline.dto';

@ApiTags('Pipeline')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pipeline')
export class PipelineController {
  constructor(private pipelineService: PipelineService) {}

  @Post('stages')
  @RequirePermissions({ module: 'opportunities', action: 'manage' })
  @ApiOperation({ summary: 'Create pipeline stage' })
  async create(@Body() dto: CreateStageDto) {
    return this.pipelineService.create(dto);
  }

  @Public()
  @Get('stages')
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  @ApiOperation({ summary: 'List all pipeline stages' })
  async findAll(@Query('includeInactive') includeInactive?: string) {
    return this.pipelineService.findAll(includeInactive === 'true');
  }

  @Put('stages/:id')
  @RequirePermissions({ module: 'opportunities', action: 'manage' })
  @ApiOperation({ summary: 'Update pipeline stage' })
  async update(@Param('id') id: string, @Body() dto: UpdateStageDto) {
    return this.pipelineService.update(id, dto);
  }

  @Delete('stages/:id')
  @RequirePermissions({ module: 'opportunities', action: 'manage' })
  @ApiOperation({ summary: 'Delete/deactivate stage' })
  async remove(@Param('id') id: string) {
    return this.pipelineService.remove(id);
  }
}
