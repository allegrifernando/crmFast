import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CohortService } from '../application/cohort.service';
import { JwtAuthGuard } from '../../identity/infrastructure/jwt-auth.guard';
import { RequirePermissions } from '../../identity/infrastructure/permissions.decorator';
import { Public } from '../../identity/infrastructure/public.decorator';
import { CreateCohortDto, UpdateCohortDto } from './dtos/cohort.dto';

@ApiTags('Catalog - Cohorts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('catalog/cohorts')
export class CohortController {
  constructor(private cohortService: CohortService) {}

  @Post()
  @RequirePermissions({ module: 'catalog', action: 'create' })
  @ApiOperation({ summary: 'Create a cohort' })
  async create(@Body() dto: CreateCohortDto) {
    return this.cohortService.create(dto);
  }

  @Public()
  @Get('by-program/:programId')
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  @ApiOperation({ summary: 'List cohorts by program' })
  async findByProgram(
    @Param('programId') programId: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.cohortService.findByProgram(programId, includeInactive === 'true');
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get cohort by ID' })
  async findById(@Param('id') id: string) {
    return this.cohortService.findById(id);
  }

  @Put(':id')
  @RequirePermissions({ module: 'catalog', action: 'update' })
  @ApiOperation({ summary: 'Update cohort' })
  async update(@Param('id') id: string, @Body() dto: UpdateCohortDto) {
    return this.cohortService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions({ module: 'catalog', action: 'delete' })
  @ApiOperation({ summary: 'Deactivate cohort' })
  async remove(@Param('id') id: string) {
    return this.cohortService.remove(id);
  }
}
