import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProgramService } from '../application/program.service';
import { JwtAuthGuard } from '../../identity/infrastructure/jwt-auth.guard';
import { RequirePermissions } from '../../identity/infrastructure/permissions.decorator';
import { Public } from '../../identity/infrastructure/public.decorator';
import { CreateProgramDto, UpdateProgramDto } from './dtos/program.dto';
import { Modality } from '@prisma/client';

@ApiTags('Catalog - Programs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('catalog/programs')
export class ProgramController {
  constructor(private programService: ProgramService) {}

  @Post()
  @RequirePermissions({ module: 'catalog', action: 'create' })
  @ApiOperation({ summary: 'Create a program' })
  async create(@Body() dto: CreateProgramDto) {
    return this.programService.create(dto);
  }

  @Public()
  @Get()
  @ApiQuery({ name: 'facultyId', required: false })
  @ApiQuery({ name: 'modality', required: false, enum: Modality })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  @ApiOperation({ summary: 'List all programs' })
  async findAll(
    @Query('facultyId') facultyId?: string,
    @Query('modality') modality?: Modality,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.programService.findAll({
      facultyId,
      modality,
      includeInactive: includeInactive === 'true',
    });
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get program by ID' })
  async findById(@Param('id') id: string) {
    return this.programService.findById(id);
  }

  @Put(':id')
  @RequirePermissions({ module: 'catalog', action: 'update' })
  @ApiOperation({ summary: 'Update program' })
  async update(@Param('id') id: string, @Body() dto: UpdateProgramDto) {
    return this.programService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions({ module: 'catalog', action: 'delete' })
  @ApiOperation({ summary: 'Deactivate program' })
  async remove(@Param('id') id: string) {
    return this.programService.remove(id);
  }
}
